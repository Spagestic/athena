"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthActions } from "@convex-dev/auth/react";

export function UserAvatar({ className }: { className?: string }) {
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);
  console.log("Current user:", user);
  const { signOut } = useAuthActions();

  return (
    <>
      {!user ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex items-center gap-4"
        >
          <Link href={"/login"}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-foreground text-background px-4 py-2 text-xs font-mono tracking-widest uppercase hover:cursor-pointer"
            >
              Login
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="group inline-flex h-auto rounded-full p-0 hover:bg-transparent">
              <Avatar className="ring-offset-background transition-all group-hover:ring-2 group-hover:ring-secondary">
                <AvatarImage alt="Profile image" src={user?.image || ""} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={`max-w-72 ${className}`}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex min-w-0 flex-col">
                <span className="truncate font-medium text-foreground text-sm">
                  {user?.name}
                </span>
                <span className="truncate font-normal text-muted-foreground text-xs">
                  {user?.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  void signOut().then(() => {
                    router.push("/login");
                  })
                }
              >
                <LogOutIcon
                  aria-hidden="true"
                  className="opacity-60"
                  size={16}
                />
                Logout
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
