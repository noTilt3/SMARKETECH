async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));

      if (errorData.error?.includes("Token") || response.status === 401) {
        console.log("Token inválido/expirado, redirecionando para login...");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userEmail");

        if (!window.location.pathname.includes("login.html")) {
          window.location.href = "/login.html";
        }
      }

      throw new Error(errorData.error || `Erro: ${response.status}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Erro: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na requisição:", error);
    throw error;
  }
}
