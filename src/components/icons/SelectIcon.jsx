import Image from "next/image";

const SelectIcon = ({ width = 24, height = 24 }) => {
  return <Image src="/select.svg" alt="Select" width={width} height={height} />;
};

export default SelectIcon;
