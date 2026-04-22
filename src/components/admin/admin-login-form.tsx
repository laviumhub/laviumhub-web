"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.message ?? "Login failed.");
        return;
      }

      const nextPath = searchParams.get("next");
      const target = nextPath && nextPath.startsWith("/admin") ? nextPath : "/admin";
      router.replace(target);
      router.refresh();
    } catch {
      setErrorMessage("Unable to reach login service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {errorMessage ? (
          <Alert color="red" icon={<IconAlertCircle size={16} />} variant="light">
            {errorMessage}
          </Alert>
        ) : null}
        <TextInput
          label="Username"
          placeholder="admin"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.currentTarget.value)}
          required
        />
        <PasswordInput
          label="Password"
          placeholder="Enter password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          required
        />
        <Button type="submit" color="red" loading={isSubmitting} fullWidth>
          Login
        </Button>
      </Stack>
    </form>
  );
}
