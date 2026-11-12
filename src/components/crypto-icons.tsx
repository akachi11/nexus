import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

function Svg({ children, className, size = 24, viewBox = "0 0 32 32" }: IconProps & { children: React.ReactNode; viewBox?: string }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {children}
    </svg>
  );
}

export function BitcoinIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path d="M22.5 14.2c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.7c-.4-.1-.9-.2-1.3-.3l.7-2.7-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.2l-2.2-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 0 .1 0 .2.1h-.2l-1.1 4.5c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.1.5c.4.1.8.2 1.1.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.9.5 5.1.3 6-2.3.7-2.1 0-3.3-1.5-4.1 1.1-.2 1.9-1.1 2.1-2.7zM19 19.3c-.5 2.1-4 1-5.1.7l.9-3.7c1.2.3 4.7.9 4.2 3zM19.6 14.2c-.5 1.9-3.4.9-4.3.7l.8-3.3c1 .2 4 .7 3.5 2.6z" fill="white" />
    </Svg>
  );
}

export function EthereumIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path d="M16.5 4v8.9l7.5 3.3L16.5 4z" fill="white" fillOpacity="0.6" />
      <path d="M16.5 4L9 16.2l7.5-3.3V4z" fill="white" />
      <path d="M16.5 21.9v6.1l7.5-10.4-7.5 4.3z" fill="white" fillOpacity="0.6" />
      <path d="M16.5 28v-6.1L9 17.6l7.5 10.4z" fill="white" />
      <path d="M16.5 20.6l7.5-4.4-7.5-3.3v7.7z" fill="white" fillOpacity="0.2" />
      <path d="M9 16.2l7.5 4.4v-7.7L9 16.2z" fill="white" fillOpacity="0.6" />
    </Svg>
  );
}

export function SolanaIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#000" />
      <defs>
        <linearGradient id="sol-g" x1="6" y1="24" x2="26" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF" />
          <stop offset="0.5" stopColor="#14F195" />
          <stop offset="1" stopColor="#00D1FF" />
        </linearGradient>
      </defs>
      <path d="M9.5 20.5l2-2.1c.2-.2.4-.3.7-.3h12.3c.3 0 .5.4.3.6l-2 2.1c-.2.2-.4.3-.7.3H9.8c-.3 0-.5-.4-.3-.6z" fill="url(#sol-g)" />
      <path d="M9.5 11.2l2-2.1c.2-.2.4-.3.7-.3h12.3c.3 0 .5.4.3.6l-2 2.1c-.2.2-.4.3-.7.3H9.8c-.3 0-.5-.4-.3-.6z" fill="url(#sol-g)" />
      <path d="M22.5 15.8l-2-2.1c-.2-.2-.4-.3-.7-.3H7.5c-.3 0-.5.4-.3.6l2 2.1c.2.2.4.3.7.3h12.3c.3 0 .5-.4.3-.6z" fill="url(#sol-g)" />
    </Svg>
  );
}

export function TetherIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path d="M17.9 17.1v-.1c-.1 0-.7-.1-2-.1-1 0-1.7 0-1.9.1v.1c-3.4-.2-5.9-.7-5.9-1.4s2.5-1.2 5.9-1.4v2.3c.3 0 .9.1 2 .1 1.3 0 1.7-.1 1.9-.1v-2.3c3.4.2 5.9.7 5.9 1.4s-2.6 1.2-5.9 1.4zm0-3v-2.1h5.5V8.5H8.7V12h5.5v2.1c-3.8.2-6.7.9-6.7 1.7s2.9 1.5 6.7 1.7v6.1h3.7v-6.1c3.8-.2 6.7-.9 6.7-1.7s-2.8-1.5-6.7-1.7z" fill="white" />
    </Svg>
  );
}

export function BnbIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
      <path d="M12.1 14.5L16 10.6l3.9 3.9 2.3-2.3L16 6l-6.2 6.2 2.3 2.3zm-2.1 1.5L7.7 16l2.3 2.3L12.3 16 10 16zm6 6l-3.9-3.9-2.3 2.3L16 26l6.2-6.2-2.3-2.3L16 21.4l.1.1zm4-4.5l2.3-2.3L20 16l-2.3 2.3 2.3 2.3zM16 13.7L13.7 16 16 18.3 18.3 16 16 13.7z" fill="white" />
    </Svg>
  );
}

export function XrpIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#23292F" />
      <path d="M23.1 9h2.6l-5.5 5.3c-2.3 2.2-6.1 2.2-8.4 0L6.3 9H8.9l4.2 4c1.5 1.5 4 1.5 5.6 0L23.1 9zM8.8 23H6.2l5.6-5.4c2.3-2.2 6.1-2.2 8.4 0L25.7 23h-2.6l-4.2-4.1c-1.5-1.5-4-1.5-5.6 0L8.8 23z" fill="white" />
    </Svg>
  );
}

export function CardanoIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#0033AD" />
      <circle cx="16" cy="8.5" r="1.5" fill="white" />
      <circle cx="16" cy="23.5" r="1.5" fill="white" />
      <circle cx="9.5" cy="12" r="1.5" fill="white" />
      <circle cx="22.5" cy="12" r="1.5" fill="white" />
      <circle cx="9.5" cy="20" r="1.5" fill="white" />
      <circle cx="22.5" cy="20" r="1.5" fill="white" />
      <circle cx="16" cy="16" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="12.5" cy="16" r="1" fill="white" />
      <circle cx="19.5" cy="16" r="1" fill="white" />
    </Svg>
  );
}

export function DogecoinIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#C2A633" />
      <path d="M13 10h4.5c3.6 0 5.5 2.3 5.5 6s-1.9 6-5.5 6H13V10zm2.5 2.3v7.4h1.8c2.2 0 3.2-1.4 3.2-3.7s-1-3.7-3.2-3.7h-1.8z" fill="white" />
      <path d="M11 15.5h8v1.5h-8z" fill="white" />
    </Svg>
  );
}

export function AvalancheIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#E84142" />
      <path d="M20.5 20.8h3c.4 0 .6-.2.6-.4 0-.1 0-.3-.1-.4l-5.4-9.5c-.2-.3-.5-.5-.8-.5s-.6.2-.8.5l-1.6 2.8 2.8 4.9h-5.7l-1.5 2.6h9.5zm-10.3 0h2.6c.3 0 .5-.1.6-.4l2-3.5-1.4-2.4L10.6 20c-.2.3-.3.5-.3.6 0 .2.2.3.6.3h-.7z" fill="white" />
    </Svg>
  );
}

export function ChainlinkIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#2A5ADA" />
      <path d="M16 6.5l-2.3 1.3-5.4 3.1v6.2l5.4 3.1L16 21.5l2.3-1.3 5.4-3.1v-6.2l-5.4-3.1L16 6.5zm3.1 11.6L16 19.8l-3.1-1.8v-3.5l3.1-1.8 3.1 1.8v3.5z" fill="white" />
    </Svg>
  );
}

export function UniswapIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#FF007A" />
      <path d="M13.2 9.4c-.2 0-.3 0-.4-.1.1-.3.3-.5.6-.7.3-.1.6-.1.7.1-.2.3-.5.5-.9.7zm.8 1.1c-.5.1-1 0-1.2-.3-.1-.2 0-.4.1-.6.4.3.9.4 1.4.3-.1.3-.2.5-.3.6zm6.5 6.7c-1.2 1.7-3 2.6-4.3 3.8-.4.4-.8.8-1 1.3-.2.5-.3 1.1-.2 1.7H14c-.1-.8 0-1.6.4-2.2.6-1 1.5-1.7 2.4-2.4 1.2-.9 2.4-1.8 3-3.2.8-1.6.5-3.7-.8-4.9-1-.9-2.3-1.2-3.6-1-.7.1-1.4.3-2 .7-.5.4-1 .9-1.2 1.5-.1.3-.2.7-.1 1 .1.3.2.6.4.8.3.3.6.4 1 .5.3.1.7.1 1-.1.3-.1.5-.4.5-.7 0-.2-.1-.3-.2-.5-.1-.1-.3-.2-.5-.2.4-.4 1.1-.5 1.6-.1.5.4.5 1.1.2 1.6-.4.5-1 .8-1.6.8-.7 0-1.3-.3-1.7-.8-.5-.6-.6-1.5-.3-2.2.3-.8 1-1.4 1.7-1.8 1.6-.8 3.6-.7 5 .4 1.2 1 1.8 2.6 1.4 4.1-.1.3-.2.6-.4.9z" fill="white" />
    </Svg>
  );
}

export function AaveIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#B6509E" />
      <path d="M21.8 22h-2.2l-1.2-3.1h-5.2L14.4 22h-1.8l-.2-.5L16 11.2c.1-.3.3-.5.5-.5h.1c.2 0 .4.2.5.5l4.7 10.3-.1.5zm-4-5l-2-5.2-2 5.2h4z" fill="white" />
    </Svg>
  );
}

export function PolygonIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#8247E5" />
      <path d="M21.3 13.2c-.4-.2-.9-.2-1.2 0l-2.9 1.7-2 1.1-2.9 1.7c-.4.2-.9.2-1.2 0l-2.3-1.3c-.4-.2-.6-.6-.6-1.1v-2.6c0-.4.2-.9.6-1.1l2.2-1.3c.4-.2.9-.2 1.2 0l2.2 1.3c.4.2.6.6.6 1.1v1.7l2-1.1v-1.7c0-.4-.2-.9-.6-1.1l-4.2-2.4c-.4-.2-.9-.2-1.2 0l-4.3 2.5c-.4.2-.6.6-.6 1v4.9c0 .4.2.9.6 1.1l4.2 2.4c.4.2.9.2 1.2 0l2.9-1.7 2-1.1 2.9-1.7c.4-.2.9-.2 1.2 0l2.2 1.3c.4.2.6.6.6 1.1v2.6c0 .4-.2.9-.6 1.1l-2.2 1.3c-.4.2-.9.2-1.2 0l-2.2-1.3c-.4-.2-.6-.6-.6-1.1v-1.7l-2 1.1v1.7c0 .4.2.9.6 1.1l4.2 2.4c.4.2.9.2 1.2 0l4.2-2.4c.4-.2.6-.6.6-1.1v-4.9c0-.4-.2-.9-.6-1.1l-4.2-2.4z" fill="white" />
    </Svg>
  );
}

export function ArbitrumIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#2D374B" />
      <path d="M17 10l5.5 9.5-1.7 1-4.5-7.8L17 10zM10.2 20.5l1.7 1 3.8-6.5-1-1.7-4.5 7.2z" fill="#28A0F0" />
      <path d="M21.8 20.5L16.3 11l-1 1.7 4.5 7.8h2z" fill="white" />
      <path d="M15.7 12.7L11.9 19.5l-1.7-1 4.5-7.2 1 1.4z" fill="white" />
    </Svg>
  );
}

export function OptimismIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#FF0420" />
      <path d="M11.6 19.6c-1.1 0-2-.3-2.6-1-.6-.6-.9-1.5-.9-2.6 0-1.4.4-2.6 1.2-3.5.8-.9 1.9-1.4 3.2-1.4 1.1 0 2 .3 2.5 1 .6.6.9 1.5.9 2.5 0 1.5-.4 2.7-1.2 3.6-.8.9-1.8 1.4-3.1 1.4zm.2-1.8c.5 0 1-.3 1.3-.8.4-.5.5-1.2.5-2.1 0-.6-.1-1-.4-1.3-.2-.3-.6-.5-1-.5s-.9.3-1.3.8c-.3.5-.5 1.2-.5 2.1 0 .6.1 1 .4 1.3.2.4.6.5 1 .5zm7.5-4.1h2.3c.8 0 1.4.2 1.8.6.4.4.6 1 .6 1.7 0 .9-.3 1.7-.8 2.2-.5.6-1.2.8-2 .8h-3.6l1.7-5.3zm.8 3.7h.5c.4 0 .7-.1.9-.4.2-.3.3-.6.3-1.1 0-.3-.1-.5-.2-.7-.2-.2-.4-.3-.7-.3h-.4l-.4 2.5z" fill="white" />
    </Svg>
  );
}

export function PepeIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#3E9B4F" />
      <ellipse cx="12" cy="13" rx="3" ry="3.5" fill="white" />
      <ellipse cx="20" cy="13" rx="3" ry="3.5" fill="white" />
      <circle cx="12.5" cy="13" r="1.5" fill="#1a1a1a" />
      <circle cx="20.5" cy="13" r="1.5" fill="#1a1a1a" />
      <path d="M10 18c0 0 2.5 4 6 4s6-4 6-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function ShibaIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#FFA409" />
      <ellipse cx="16" cy="15" rx="6" ry="7" fill="#C6750A" />
      <ellipse cx="16" cy="17" rx="4" ry="4" fill="#FFA409" />
      <circle cx="13.5" cy="13" r="1.2" fill="white" />
      <circle cx="18.5" cy="13" r="1.2" fill="white" />
      <circle cx="13.5" cy="13.2" r="0.6" fill="#1a1a1a" />
      <circle cx="18.5" cy="13.2" r="0.6" fill="#1a1a1a" />
      <ellipse cx="16" cy="15.5" rx="1.5" ry="1" fill="#C6750A" />
    </Svg>
  );
}

export function UsdcIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <path d="M20.2 18.4c0-1.7-1-2.3-3.1-2.5-1.5-.2-1.8-.5-1.8-1.2s.5-1.1 1.5-1.1c.9 0 1.4.3 1.6 1.1h1.7c-.2-1.4-1.2-2.3-2.8-2.5V10.5h-1.7v1.7c-1.6.2-2.7 1.3-2.7 2.7 0 1.6 1 2.3 3.1 2.5 1.4.2 1.8.6 1.8 1.3 0 .7-.6 1.2-1.6 1.2-1.2 0-1.7-.5-1.8-1.3H13c.2 1.6 1.3 2.5 2.9 2.7v1.7h1.7v-1.7c1.6-.3 2.6-1.3 2.6-2.8z" fill="white" />
    </Svg>
  );
}

export function DaiIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#F5AC37" />
      <path d="M10 14.5h1.5c.5-2 2.2-3.3 4.5-3.3s4 1.3 4.5 3.3H22v1.5h-1.3c0 .2 0 .4 0 .5v.5H22v1.5h-1.5c-.5 2-2.2 3.3-4.5 3.3s-4-1.3-4.5-3.3H10v-1.5h1.3c0-.2 0-.4 0-.5v-.5H10v-1.5zm3.3 0h5.4c-.4-1.2-1.5-2-2.7-2s-2.3.8-2.7 2zm5.4 3.5h-5.4c.4 1.2 1.5 2 2.7 2s2.3-.8 2.7-2zm-5.5-2v1.5h5.6v-1.5h-5.6z" fill="white" />
    </Svg>
  );
}

export function AppleIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#1a1a1a" />
      <path d="M21.5 21.5c-.5.7-1 1.4-1.8 1.4-.8 0-1-.5-2-.5s-1.2.5-2 .5c-.7 0-1.3-.7-1.8-1.4-1-1.4-1.7-4-.7-5.7.5-.9 1.4-1.4 2.3-1.5.8 0 1.5.5 2 .5s1.4-.6 2.3-.5c.4 0 1.5.2 2.2 1.3-2 1.2-1.7 4.2.5 5.3-.3.8-.5 1.1-1 1.6zM18 10.5c.4-.5.6-1.2.6-1.8-.7 0-1.4.4-1.9 1-.4.5-.7 1.1-.6 1.8.7 0 1.4-.4 1.9-1z" fill="white" />
    </Svg>
  );
}

export function MicrosoftIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#00A4EF" />
      <rect x="9" y="9" width="6.5" height="6.5" fill="#F25022" rx="0.5" />
      <rect x="16.5" y="9" width="6.5" height="6.5" fill="#7FBA00" rx="0.5" />
      <rect x="9" y="16.5" width="6.5" height="6.5" fill="#00A4EF" rx="0.5" />
      <rect x="16.5" y="16.5" width="6.5" height="6.5" fill="#FFB900" rx="0.5" />
    </Svg>
  );
}

export function NvidiaIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#76B900" />
      <path d="M12.5 13.5c1.5-.8 3-.5 3-.5v2s-1.2-.2-2.3.4c-1.2.7-1.7 2-1.7 2H9.5s.8-2.8 3-3.9zm6.5.5v-2.5c-3.5-.8-6.5.8-8 2.5-2 2.3-2 5-2 5h2.5s0-2 1-3.2c1.2-1.4 3-1.8 4.5-1.8v2.5l4-3.5-2-2z" fill="white" />
    </Svg>
  );
}

export function TeslaIcon({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="16" cy="16" r="16" fill="#CC0000" />
      <path d="M16 8l-6.5 2.5L11 12c1.5-.5 3.2-.8 5-.8s3.5.3 5 .8l1.5-1.5L16 8zm0 4.5c-1.3 0-2.5.1-3.5.4L16 24l3.5-11.1c-1-.3-2.2-.4-3.5-.4z" fill="white" />
    </Svg>
  );
}

const iconMap: Record<string, React.ComponentType<IconProps>> = {
  BTC: BitcoinIcon,
  ETH: EthereumIcon,
  SOL: SolanaIcon,
  USDT: TetherIcon,
  USDC: UsdcIcon,
  DAI: DaiIcon,
  BNB: BnbIcon,
  XRP: XrpIcon,
  ADA: CardanoIcon,
  DOGE: DogecoinIcon,
  AVAX: AvalancheIcon,
  LINK: ChainlinkIcon,
  UNI: UniswapIcon,
  AAVE: AaveIcon,
  POL: PolygonIcon,
  ARB: ArbitrumIcon,
  OP: OptimismIcon,
  PEPE: PepeIcon,
  SHIB: ShibaIcon,
  AAPL: AppleIcon,
  MSFT: MicrosoftIcon,
  NVDA: NvidiaIcon,
  TSLA: TeslaIcon,
};

export function CryptoIcon({
  symbol,
  size = 24,
  className,
  fallbackColor,
  fallbackIcon,
}: {
  symbol: string;
  size?: number;
  className?: string;
  fallbackColor?: string;
  fallbackIcon?: string;
}) {
  const Icon = iconMap[symbol.toUpperCase()];
  if (Icon) return <Icon size={size} className={className} />;

  return (
    <div
      className={cn("flex items-center justify-center rounded-full font-heading font-bold", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: (fallbackColor ?? "#6366f1") + "22",
        color: fallbackColor ?? "#6366f1",
        fontSize: size * 0.4,
      }}
    >
      {fallbackIcon || symbol.slice(0, 2)}
    </div>
  );
}
