-- Replace order workflow:
-- submitted -> approved -> packed -> shipped, with cancellation before shipped.

DROP FUNCTION IF EXISTS public.cancel_order(UUID);
DROP FUNCTION IF EXISTS public.update_order_status(UUID, public.order_status);

ALTER TYPE public.order_status RENAME TO order_status_old;

CREATE TYPE public.order_status AS ENUM (
  'submitted',
  'approved',
  'packed',
  'shipped',
  'cancelled'
);

ALTER TABLE public.orders
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.orders
  ALTER COLUMN status TYPE public.order_status
  USING (
    CASE status::TEXT
      WHEN 'fulfilled' THEN 'shipped'
      ELSE status::TEXT
    END
  )::public.order_status;

ALTER TABLE public.orders
  ALTER COLUMN status SET DEFAULT 'submitted';

DROP TYPE public.order_status_old;

-- User cancellation: users may cancel only their own submitted orders.
-- Inventory is restored atomically before the order is marked cancelled.
CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_user_id UUID;
  v_order_status public.order_status;
BEGIN
  SELECT user_id, status
  INTO v_order_user_id, v_order_status
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not allowed to cancel this order';
  END IF;

  IF v_order_status <> 'submitted' THEN
    RAISE EXCEPTION 'Order can only be cancelled while submitted';
  END IF;

  UPDATE public.seed_packages AS sp
  SET
    quantity_available = sp.quantity_available + oi.quantity,
    updated_at = NOW()
  FROM public.order_items AS oi
  WHERE oi.order_id = p_order_id
    AND oi.seed_package_id = sp.id;

  UPDATE public.orders
  SET
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_order_id
    AND status = 'submitted';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order was already cancelled or processed';
  END IF;
END;
$$;

-- Admin workflow updates: strict forward chain or cancellation before shipped.
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id UUID,
  p_status public.order_status
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_status public.order_status;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin role required';
  END IF;

  SELECT status
  INTO v_order_status
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order_status IN ('cancelled', 'shipped') THEN
    RAISE EXCEPTION 'Order can no longer be changed';
  END IF;

  IF p_status = 'cancelled' THEN
    UPDATE public.seed_packages AS sp
    SET
      quantity_available = sp.quantity_available + oi.quantity,
      updated_at = NOW()
    FROM public.order_items AS oi
    WHERE oi.order_id = p_order_id
      AND oi.seed_package_id = sp.id;
  ELSIF NOT (
    (v_order_status = 'submitted' AND p_status = 'approved')
    OR (v_order_status = 'approved' AND p_status = 'packed')
    OR (v_order_status = 'packed' AND p_status = 'shipped')
  ) THEN
    RAISE EXCEPTION 'Invalid order status transition';
  END IF;

  UPDATE public.orders
  SET
    status = p_status,
    updated_at = NOW()
  WHERE id = p_order_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cancel_order(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_order(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.update_order_status(UUID, public.order_status) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_order_status(UUID, public.order_status) TO authenticated;
