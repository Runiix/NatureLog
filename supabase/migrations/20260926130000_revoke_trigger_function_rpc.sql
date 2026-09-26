-- Trigger functions are exposed as /rest/v1/rpc/<name> like any function in
-- public (Security Advisor lints 0028/0029). Firing a trigger does not check
-- EXECUTE, so nobody needs it; revoking only closes the RPC endpoint.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.sync_auth_users_to_public() from public, anon, authenticated;
revoke execute on function public.spotted_counts_trigger() from public, anon, authenticated;
