"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  ExclamationTriangleIcon,
  ReloadIcon,
  HomeIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isResetting, setIsResetting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    technical?: string;
  }>({
    message: "An unexpected error occurred.",
  });

  useEffect(() => {
    // Log error for debugging
    console.error("Error captured:", error);

    // Process error message to be more user-friendly
    const errorMessage = error.message || "An unexpected error occurred.";

    // Format technical details for development environments
    const technicalDetails =
      process.env.NODE_ENV === "development"
        ? `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ""}${error.digest ? `\nDigest: ${error.digest}` : ""}`
        : undefined;

    setErrorDetails({
      message: formatErrorForUser(errorMessage),
      technical: technicalDetails,
    });
  }, [error]);

  // Function to make error messages more user-friendly
  const formatErrorForUser = (message: string): string => {
    // Map technical error messages to user-friendly messages
    const errorMappings: Record<string, string> = {
      "Network Error":
        "We're having trouble connecting to our servers. Please check your internet connection.",
      "Failed to fetch":
        "We couldn't retrieve the data you requested. Please try again later.",
      "Not Found": "The page or resource you requested could not be found.",
      "500": "Our servers encountered an issue. Our team has been notified.",
      ECONNREFUSED:
        "Connection to the server was refused. Please try again later.",
    };

    // Check if the error message contains any of our known error keys
    for (const [key, friendlyMessage] of Object.entries(errorMappings)) {
      if (message.includes(key)) {
        return friendlyMessage;
      }
    }

    // If no specific match, return a generic but friendly message
    return message.length > 100
      ? "Something went wrong with your request. Please try again."
      : message;
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Add small delay for better UX
      reset();
    } catch (e) {
      console.error("Reset failed:", e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg space-y-6 rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Oops! Something went wrong
          </h1>
          <p className="mt-2 text-gray-600">
            We apologize for the inconvenience
          </p>
        </div>

        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTitle className="font-medium text-red-800">
            Error Details
          </AlertTitle>
          <AlertDescription className="mt-2 text-red-700">
            {errorDetails.message}
          </AlertDescription>
        </Alert>

        {errorDetails.technical && process.env.NODE_ENV === "development" && (
          <div className="rounded border border-gray-200 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-700">
              Technical Details:
            </p>
            <pre className="mt-2 max-h-32 overflow-auto text-xs text-gray-600">
              {errorDetails.technical}
            </pre>
          </div>
        )}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            onClick={handleReset}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isResetting}
          >
            {isResetting ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Trying again...
              </>
            ) : (
              <>
                <ReloadIcon className="mr-2 h-4 w-4" />
                Try Again
              </>
            )}
          </Button>

          <Link href="/" passHref>
            <Button variant="outline" className="flex-1">
              <HomeIcon className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
