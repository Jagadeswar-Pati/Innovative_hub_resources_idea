type AvatarProps = {
  initials: string;
  size?: number;
  color?: string;
};

export function Avatar({ initials, size = 36, color = "#F5A623" }: AvatarProps) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-syne font-bold text-[#0A0A0F]"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        fontSize: size / 3,
      }}
    >
      {initials}
    </div>
  );
}
