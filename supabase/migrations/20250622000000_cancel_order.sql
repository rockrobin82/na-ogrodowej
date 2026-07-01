-- Atomically cancel a submitted order and return reserved seeds to inventory.

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

REVOKE EXECUTE ON FUNCTION public.cancel_order(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_order(UUID) TO authenticated;
