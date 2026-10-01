type FetchOptions<B> = {
  url: string;
  token: string | null;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: B;
};

export async function apiFetch<T, B = undefined>({
  url,
  token,
  method = "GET",
  body,
}: FetchOptions<B>): Promise<{
  res: Response;
  data: T;
}> {
  const res = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data: T = await res.json();

  return {
    res,
    data,
  };
}
