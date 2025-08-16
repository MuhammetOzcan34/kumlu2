-- This replaces admin policies to use a SECURITY DEFINER helper function instead of
-- self-referencing the same table within the policy.

-- Ensure helper exists (idempotent)
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid LIMIT 1;
$$;

-- Drop problematic admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate admin policies without self-referencing queries
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  public.get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (
  public.get_user_role(auth.uid()) = 'admin'
);