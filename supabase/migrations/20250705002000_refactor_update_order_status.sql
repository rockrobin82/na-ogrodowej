-- Refactor admin order status management.
-- Allows free movement between active workflow statuses while preserving
-- immutable cancelled orders, timestamp cleanup, tracking rules and permissions.

CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id UUID,
  p_status public.order_status,
  p_tracking_number TEXT DEFAULT NULL
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

  IF v_order_status = 'cancelled' THEN
    RAISE EXCEPTION 'Cancelled orders can no longer be changed';
  END IF;

  IF p_status = 'cancelled' THEN
    UPDATE public.seed_packages AS sp
    SET
      quantity_available = sp.quantity_available + oi.quantity,
      updated_at = NOW()
    FROM public.order_items AS oi
    WHERE oi.order_id = p_order_id
      AND oi.seed_package_id = sp.id;
  END IF;

  UPDATE public.orders
  SET
    status = p_status,
    approved_at = CASE
      WHEN p_status IN ('approved', 'packed', 'shipped')
        THEN COALESCE(approved_at, NOW())
      ELSE NULL
    END,
    packed_at = CASE
      WHEN p_status IN ('packed', 'shipped')
        THEN COALESCE(packed_at, NOW())
      ELSE NULL
    END,
    shipped_at = CASE
      WHEN p_status = 'shipped'
        THEN COALESCE(shipped_at, NOW())
      ELSE NULL
    END,
    tracking_number = CASE
      WHEN p_status = 'shipped'
        THEN NULLIF(TRIM(COALESCE(p_tracking_number, '')), '')
      ELSE NULL
    END,
    updated_at = NOW()
  WHERE id = p_order_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_order_status(UUID, public.order_status, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_order_status(UUID, public.order_status, TEXT) TO authenticated;
