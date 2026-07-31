import Image from "next/image";
import Link from "next/link";

export default function BrandLink({ size = 24 }: { size?: number }) {
  return (
    <Link href="/">
      <Image src="/icon.svg" alt="KitchenKin" height={size} width={size} />
    </Link>
  );
}
