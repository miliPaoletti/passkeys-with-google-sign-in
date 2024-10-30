import Link from "next/link";

export const Navbar = () => {
  return (
    <div className="relative">
      <div className="bg-white text-black w-full p-4 gap-5 justify-end flex fixed top-0 left-0 right-0">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/">Home</Link>
      </div>
    </div>
  );
};
