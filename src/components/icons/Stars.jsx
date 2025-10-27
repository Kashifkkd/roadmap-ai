import Image from "next/image";

export default function Stars({ width = 20, height = 20 }) {
  return <Image src="/stars.svg" alt="Stars" width={width} height={height} />;
}
