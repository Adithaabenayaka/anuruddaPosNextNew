import Link from "next/link";
import * as Icons from "@/assets/icons/index";

export type IconName = keyof typeof Icons;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  height?: number;
  width?: number;
  color?: string;
  className?: string;
  to?: string;
  target?: string;
}

export default function Icon({
  name,
  height = 20,
  width = 20,
  color = "currentColor",
  className = "",
  to,
  // target = "_blank",
  ...props
}: IconProps) {
  const SvgIcon = Icons[name];
  if (!SvgIcon) return null;

  const icon = (
    <SvgIcon
      {...(width ? { width } : {})}
      {...(height ? { height } : {})}
      fill={color}
      className={className}
      {...props}
      preserveAspectRatio="xMidYMid meet"
      // {...(width && height ? { viewBox: `0 0 ${width} ${height}` } : {})}
    />
  );

  return to ? <Link href={to}>{icon}</Link> : icon;
}
