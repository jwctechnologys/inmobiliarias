import { API_URL } from '../config';
export const getCsrfToken = async () => {

    const response = await fetch(
      `${API_URL}/api/csrf/`,
      {
        method: "GET",
        credentials: "include"
      }
    );

    if (!response.ok){
       throw new Error("Unable to fetch CSRF token");
    }

    const data = await response.json();

    //console.log("CSRF RESPONSE:", data);
    //console.log("COOKIES:", document.cookie);

    return data.csrfToken;
};