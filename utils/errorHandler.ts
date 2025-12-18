
export interface FriendlyError {
  title: string;
  message: string;
  suggestion?: string;
}

export const getUserFriendlyError = (error: any): FriendlyError => {
  let msg = "An unexpected error occurred.";
  if (typeof error === 'string') msg = error;
  else if (error instanceof Error) msg = error.message;
  else if (error && typeof error === 'object' && 'message' in error) msg = String(error.message);
  else if (error && typeof error === 'object' && 'error' in error && typeof error.error === 'object' && 'message' in error.error) msg = String(error.error.message);

  const lowerMsg = msg.toLowerCase();
  const errorJson = JSON.stringify(error).toLowerCase();

  // Browser File Access Errors
  if (lowerMsg.includes("not found") && lowerMsg.includes("file")) {
    return {
      title: "File Inaccessible",
      message: "The application could not access the file. This often happens if the file was moved, renamed, or deleted after you selected it.",
      suggestion: "Please try selecting the file again from its current location."
    };
  }

  // API Key / Auth / Permissions (403, 401)
  if (lowerMsg.includes("403") || lowerMsg.includes("permission denied") || lowerMsg.includes("location") || errorJson.includes("permission_denied")) {
    return {
      title: "Access Restricted",
      message: "The request was rejected. This typically happens if the model is not available in your region or requires a paid API key that hasn't been selected.",
      suggestion: "Ensure you have selected a valid project with billing enabled."
    };
  }

  if (lowerMsg.includes("401") || lowerMsg.includes("unauthenticated") || lowerMsg.includes("invalid api key")) {
    return {
      title: "Authentication Failed",
      message: "The API key provided is missing or invalid.",
      suggestion: "Please refresh the page to reset your session."
    };
  }

  // App specific Key selection
  if (lowerMsg.includes("api key selection is required")) {
      return {
          title: "Action Required",
          message: "You must select a paid API key to use this premium feature.",
          suggestion: "Please try again and complete the key selection dialog."
      };
  }

  // Quota (429) - RESOURCE_EXHAUSTED
  if (lowerMsg.includes("429") || lowerMsg.includes("quota") || lowerMsg.includes("exhausted") || errorJson.includes("resource_exhausted")) {
    return {
      title: "Rate Limit Exceeded",
      message: "The Google Gemini API has reached its maximum allowable requests for your current plan (Quota Exceeded).",
      suggestion: "Please wait 60 seconds for the quota window to reset. If you are on the Free Tier, consider using a project with billing enabled for higher limits."
    };
  }

  // Server Issues (500, 503)
  if (lowerMsg.includes("500") || lowerMsg.includes("503") || lowerMsg.includes("internal") || lowerMsg.includes("overloaded")) {
     return {
      title: "Service Unavailable",
      message: "Google's AI service is currently experiencing high load or technical difficulties.",
      suggestion: "Please try again in a few seconds."
    };
  }

  // Bad Request / Safety (400)
  if (lowerMsg.includes("400") || lowerMsg.includes("invalid argument")) {
     return {
         title: "Invalid Request",
         message: "The model couldn't process your request. This might be due to an unsupported file format or invalid parameters.",
         suggestion: "Try using a different file or simplified prompt."
     };
  }

  // Safety specifically
  if (lowerMsg.includes("safety") || lowerMsg.includes("harmful") || lowerMsg.includes("blocked")) {
    return {
      title: "Content Blocked",
      message: "The model flagged the input or generated content as potentially unsafe.",
      suggestion: "Try adjusting your prompt to be less sensitive."
    };
  }
  
  // Network
  if (lowerMsg.includes("fetch") || lowerMsg.includes("network")) {
      return {
          title: "Connection Error",
          message: "Could not connect to the API. You might be offline.",
          suggestion: "Check your internet connection and try again."
      };
  }

  // Fallback
  return {
    title: "An Error Occurred",
    message: msg,
    suggestion: "Check the console for technical details."
  };
};
