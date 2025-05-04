"use client";

import { useState, useEffect } from "react";
import {useParams, useRouter} from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface QrCodeData {
  tableId: string;
  tableNumber: string;
  qrCodeUrl: string;
  qrCodeDataUrl: string;
  downloadUrl: string;
}

export default function TableQrCodePage(){
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [qrCodeData, setQrCodeData] = useState<QrCodeData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const response = await fetch(`/api/admin/tables/${params.id}/qrcode`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch QR code");
        }
        
        const data = await response.json();
        setQrCodeData(data);
      } catch (error) {
        console.error("Error fetching QR code:", error);
        toast.error("Failed to load QR code");
      } finally {
        setLoading(false);
      }
    };

    fetchQrCode();
  }, [params.id]);

  const handleDownload = () => {
    if (!qrCodeData) return;
    
    // Create a link element and trigger download
    const link = document.createElement("a");
    link.href = qrCodeData.qrCodeDataUrl;
    link.download = `table-${qrCodeData.tableNumber}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tables
      </Button>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : qrCodeData ? (
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Table {qrCodeData.tableNumber} QR Code</CardTitle>
              <CardDescription>
                Scan this QR code to access the table
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="overflow-hidden rounded-lg border p-2">
                <Image
                  src={qrCodeData.qrCodeDataUrl}
                  alt={`QR Code for Table ${qrCodeData.tableNumber}`}
                  width={250}
                  height={250}
                  className="h-auto w-auto"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <p className="text-center text-sm text-muted-foreground">
                This QR code links to: <br />
                <span className="font-mono text-xs">{qrCodeData.qrCodeUrl}</span>
              </p>
              <Button onClick={handleDownload} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-6 text-center">
          QR code not found.
        </div>
      )}
    </div>
  );
}
