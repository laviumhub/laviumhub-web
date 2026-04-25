export const config = {
  schedule: "0,30 23 * * 1-3",
};

export default async function handler() {
  const token = process.env.MACHINE_REFRESH_JOB_TOKEN;
  const baseUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;

  if (!token) {
    return new Response("MACHINE_REFRESH_JOB_TOKEN is not configured.", { status: 500 });
  }

  if (!baseUrl) {
    return new Response("Netlify URL environment variable is not available.", { status: 500 });
  }

  try {
    const response = await fetch(`${baseUrl}/api/internal/machines/refresh`, {
      method: "POST",
      headers: {
        "x-machine-refresh-token": token,
      },
    });

    const text = await response.text();
    return new Response(text, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scheduler error";
    return new Response(message, { status: 500 });
  }
}
