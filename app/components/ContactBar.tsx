import { FaDiscord, FaWhatsapp } from "react-icons/fa";

export default function ContactBar() {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-end items-center space-x-4">
          <span className="text-sm text-gray-600">
            Need help? Contact support:
          </span>
          <a
            href="https://discord.gg/ZJ5UkFjsTz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FaDiscord className="w-5 h-5 mr-1" />
            <span className="text-sm">Discord</span>
          </a>
          <a
            href="https://wa.me/15033448496"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-green-600 hover:text-green-800 transition-colors"
          >
            <FaWhatsapp className="w-5 h-5 mr-1" />
            <span className="text-sm">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
