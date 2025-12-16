import { BillingError } from "./errors";

/**
 * Gère les erreurs HTTP de manière uniforme
 * Essaie d'extraire le message d'erreur depuis le body JSON ou texte
 */
export async function handleHttpError(response: Response): Promise<never> {
  let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
  let errorCode = `HTTP_${response.status}`;

  try {
    const errorData = await response.json();
    if (errorData.error) {
      errorMessage = errorData.error;
    }
    if (errorData.code) {
      errorCode = errorData.code;
    }
  } catch {
    // If not JSON, try text
    const errorText = await response.text();
    if (errorText) {
      errorMessage = errorText;
    }
  }

  throw new BillingError(errorMessage, errorCode);
}

/**
 * Gère les erreurs génériques et les convertit en BillingError
 */
export function handleError(error: unknown): never {
  if (error instanceof BillingError) {
    throw error;
  }
  if (error instanceof Error) {
    throw new BillingError(error.message, "NETWORK_ERROR");
  }
  throw new BillingError("An unexpected error occurred", "UNKNOWN");
}
