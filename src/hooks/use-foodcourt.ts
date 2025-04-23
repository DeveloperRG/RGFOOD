import { useState } from "react";
import {
    createFoodcourt,
    type CreateFoodcourtInput
} from "~/server/actions/foodcourts/create-foodcourt";
import {
    updateFoodcourt,
    type UpdateFoodcourtInput
} from "~/server/actions/foodcourts/update-foodcourt";
import {
    deleteFoodcourt,
    type DeleteFoodcourtInput
} from "~/server/actions/foodcourts/delete-foodcourt";
import {
    toggleFoodcourtStatus,
    type ToggleStatusInput
} from "~/server/actions/foodcourts/toogle-status";
import {
    assignOwner,
    type AssignOwnerInput
} from "~/server/actions/foodcourts/assign-owner";

export function useCreateFoodcourt() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const create = async (data: CreateFoodcourtInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await createFoodcourt(data);
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
        create,
        isLoading,
        error,
    };
}

export function useUpdateFoodcourt() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = async (data: UpdateFoodcourtInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await updateFoodcourt(data);
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
        update,
        isLoading,
        error,
    };
}

export function useDeleteFoodcourt() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const remove = async (data: DeleteFoodcourtInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await deleteFoodcourt(data);
            if (!result.success) {
                setError(result.error);
                return false;
            }
            return true;
        } catch (err) {
            setError("An unexpected error occurred");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        remove,
        isLoading,
        error,
    };
}

export function useToggleFoodcourtStatus() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggle = async (data: ToggleStatusInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await toggleFoodcourtStatus(data);
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
        toggle,
        isLoading,
        error,
    };
}

export function useAssignOwner() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const assign = async (data: AssignOwnerInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await assignOwner(data);
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
        assign,
        isLoading,
        error,
    };
}