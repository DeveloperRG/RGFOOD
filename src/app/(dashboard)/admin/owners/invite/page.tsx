import { Metadata } from "next";
import { InviteOwnerForm } from "~/components/owners/invite-owner-form";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Invite Owner",
    description: "Invite a new foodcourt owner",
};

export default function InviteOwnerPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Link href="/admin/owners">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Owners
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Invite Owner</h1>
                <p className="text-muted-foreground">
                    Invite a new foodcourt owner to the platform
                </p>
            </div>

            <InviteOwnerForm />
        </div>
    );
}