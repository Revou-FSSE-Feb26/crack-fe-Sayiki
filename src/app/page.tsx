import Image from "next/image";
import RegisterPage from "./register/page";
import LoginPage from "./login/page";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function Home() {
  return (
    <>
    <Link href="/register"></Link>
    <Link href="/login"></Link>
    <div className="flex flex-col gap-4 justify-center items-center">
      <Link href="/login"><Button>login</Button></Link>
      <Link href="/register"><Button>Register</Button></Link>
      
    </div>
    
    </>
  );
}
