import { useQuery } from "@tanstack/react-query";
import { keys } from "@/lib/query-keys";
import { usersApi } from "@/lib/api/users";

export const useMe = () =>
  useQuery({ queryKey: keys.users.me(), queryFn: usersApi.me });

export const useUserPublicProfile = (userId: string) =>
  useQuery({
    queryKey: keys.users.detail(userId),
    queryFn: () => usersApi.publicProfile(userId),
    enabled: !!userId,
  });
