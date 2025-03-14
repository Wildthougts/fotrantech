"use client";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import { Service } from "@/utils/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const [quantity, setQuantity] = useState(1);
  const ADMIN_WHATSAPP = "15033448496"; // Replace with your WhatsApp number
  const wallets = {
    BTC: "bc1q5w5z32u4rh9agjxq5869zjlta4l2suw3d33ugg",
    USDT: "TCcavsTNqxapcEnSv7UdWmxPm21efGRmTD",
    LTC: "ltc1q7v77e3grvs4sa8xwwry96u9mjytuad66lv4pja",
    ETH: "0x8De8210Ec2b47b4D1e8aD6dd398B4d142E95406b",
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const totalPrice = service.price * quantity;

  const handleContactAdmin = () => {
    const message = encodeURIComponent(
      `Hello! I'd like to verify my payment for ${service.name} (Quantity: ${quantity}, Total: $${totalPrice} USD)`
    );
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, "_blank");
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
      <p className="text-gray-600 mb-4">{service.description}</p>
      <div className="flex items-baseline mb-4">
        <span className="text-3xl font-bold">${service.price}</span>
        <span className="text-gray-500 ml-2">/mo</span>
      </div>

      <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-md">
        <Label>Quantity:</Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
          >
            -
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
          >
            +
          </Button>
        </div>
      </div>

      <div className="mb-4 text-right">
        <span className="text-sm text-gray-600">Total: </span>
        <span className="text-lg font-bold">${totalPrice}</span>
      </div>

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
              To purchase {service.name} (Quantity: {quantity}) pay the total
              amount of ${totalPrice} to any of the crypto wallet below and send
              confirmation to the admin
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center mb-4 space-x-2">
            <div className="grid flex-1 gap-2">
              <Label className="text-center mb-4  text-xl">BTC Address</Label>
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
                USDT
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
              <Label className="text-center mb-4  text-xl">LTC Address</Label>
              <Label htmlFor="link" className="sr-only">
                LTC
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
              <Label className="text-center mb-4  text-xl">ETH Address</Label>
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
    </Card>
  );
}
