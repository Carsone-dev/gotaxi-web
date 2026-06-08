import { get, patch, post, del, apiClient } from "@/lib/api";
import type { UserRead, UserUpdate, AvisRead } from "@/types/domain";

export const usersApi = {
  me: () => get<UserRead>("/users/me"),
  updateMe: (data: UserUpdate) => patch<UserRead>("/users/me", data),
  deleteMe: () => del<{ message: string }>("/users/me"),
  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient
      .post<UserRead>("/users/me/photo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  registerFcmToken: (token: string) =>
    post<{ message: string }>(`/users/me/fcm-token?token=${encodeURIComponent(token)}`),
  myAvis: () => get<AvisRead[]>("/users/me/avis"),
  publicProfile: (userId: string) => get<UserRead>(`/users/${userId}`),
};
