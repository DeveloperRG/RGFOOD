import { useState } from "react";
import {
    updateOwnerPermissions,
    type UpdatePermissionsInput
} from "~/server/actions/owners/update-permissions";

export function useUpdatePermissions() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updatePermissions = async (data: UpdatePermissionsInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await updateOwnerPermissions(data);
            if (!result.success) {
                setError(result.error);
                return null;
            }
            return result.data;
        } catch (err) {
            setError("An unexpected error occurred");
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        updatePermissions,
        isLoading,
        error,
    };
}