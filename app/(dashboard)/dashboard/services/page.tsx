"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Service } from "@/utils/services";
import toast from "react-hot-toast";

// interface ServicesPage {}

export default function ServicesPage() {
  const ADMIN_WHATSAPP = "15033448496";
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading services...</p>
      </div>
    );
  }
  // Replace with your WhatsApp number
  const wallets = {
    BTC: "bc1q5w5z32u4rh9agjxq5869zjlta4l2suw3d33ugg",
    USDT: "TCcavsTNqxapcEnSv7UdWmxPm21efGRmTD",
    LTC: "ltc1q7v77e3grvs4sa8xwwry96u9mjytuad66lv4pja",
    ETH: "0x8De8210Ec2b47b4D1e8aD6dd398B4d142E95406b",
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Available Services
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const handleContactAdmin = () => {
            const message = encodeURIComponent(
              `Hello! I'd like to verify my payment for ${service.name} (${service.price} USD)`
            );
            window.open(
              `https://wa.me/${ADMIN_WHATSAPP}?text=${message}`,
              "_blank"
            );
          };

          return (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {service.name}
                  </h2>
                  <p className="mt-1 text-lg font-medium text-indigo-600">
                    ${service.price} /mo
                  </p>
                </div>

                <p className="text-gray-500">{service.description}</p>

                {/* {service.image_url && (
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-full h-48 object-cover rounded-md"
                  />
                )} */}

                {service.youtube_url && (
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={service.youtube_url}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-md"
                    />
                  </div>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Purchase
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold mb-4">
                        Payment Invoice
                      </DialogTitle>
                      <DialogDescription>
                        To purchase {service.name} pay the total amount of $
                        {service.price} to any of the crypto wallet below and
                        send confirmation to the admin
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center mb-4 space-x-2">
                      <div className="grid flex-1 gap-2">
                        <Label className="text-center mb-4  text-xl">
                          BTC Address
                        </Label>
                        <Label htmlFor="link" className="sr-only">
                          BTC
                        </Label>
                        <Input id="link" defaultValue={wallets.BTC} readOnly />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="px-3"
                        onClick={() => handleCopy(wallets.BTC)}
                      >
                        <span className="sr-only">Copy</span>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center mb-4 space-x-2">
                      <div className="grid flex-1 gap-2">
                        <Label className="text-center mb-4  text-xl">
                          USDT trc20 Address
                        </Label>
                        <Label htmlFor="link" className="sr-only">
                          BTC
                        </Label>
                        <Input id="link" defaultValue={wallets.USDT} readOnly />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="px-3"
                        onClick={() => handleCopy(wallets.USDT)}
                      >
                        <span className="sr-only">Copy</span>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center mb-4 space-x-2">
                      <div className="grid flex-1 gap-2">
                        <Label className="text-center mb-4  text-xl">
                          LTC Address
                        </Label>
                        <Label htmlFor="link" className="sr-only">
                          BTC
                        </Label>
                        <Input id="link" defaultValue={wallets.LTC} readOnly />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="px-3"
                        onClick={() => handleCopy(wallets.LTC)}
                      >
                        <span className="sr-only">Copy</span>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center mb-4 space-x-2">
                      <div className="grid flex-1 gap-2">
                        <Label className="text-center mb-4  text-xl">
                          ETH Address
                        </Label>
                        <Label htmlFor="link" className="sr-only">
                          ETH
                        </Label>
                        <Input id="link" defaultValue={wallets.ETH} readOnly />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="px-3"
                        onClick={() => handleCopy(wallets.LTC)}
                      >
                        <span className="sr-only">Copy</span>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={handleContactAdmin}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Verify Payment via WhatsApp
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          );
        })}
        {services.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-12">
            No services available at the moment.
          </p>
        )}
      </div>
    </div>
  );
}
