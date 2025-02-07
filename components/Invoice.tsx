import { Button } from "@/components/ui/button";

interface InvoiceProps {
  amount: number;
  serviceName: string;
  onClose: () => void;
}

export default function Invoice({
  amount,
  serviceName,
  onClose,
}: InvoiceProps) {
  const ADMIN_WHATSAPP = "YOUR_WHATSAPP_NUMBER"; // Replace with your WhatsApp number
  const wallets = {
    BTC: "YOUR_BTC_WALLET",
    ETH: "YOUR_ETH_WALLET",
    USDT: "YOUR_USDT_WALLET",
  };

  const handleContactAdmin = () => {
    const message = encodeURIComponent(
      `Hello! I'd like to verify my payment for ${serviceName} (${amount} USD)`
    );
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, "_blank");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4">Payment Invoice</h2>
      <div className="mb-4">
        <p className="text-gray-600">Service: {serviceName}</p>
        <p className="text-gray-600">Amount: ${amount} USD</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-1">BTC Address</h3>
          <p className="text-sm break-all">{wallets.BTC}</p>
        </div>
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-1">ETH Address</h3>
          <p className="text-sm break-all">{wallets.ETH}</p>
        </div>
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-1">USDT (TRC20) Address</h3>
          <p className="text-sm break-all">{wallets.USDT}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleContactAdmin}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Verify Payment via WhatsApp
        </Button>
        <Button variant="outline" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
}
