import { motion, useReducedMotion } from "motion/react";

export default function WhatsApp() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.a
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.4, ease: [0.16, 1, 0.3, 1] }}
      href="https://wa.link/fz5g34"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Olanrewaju on WhatsApp"
      className="focus-ring group fixed bottom-6 right-6 z-[1000] flex min-h-14 items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-[0_14px_34px_rgba(37,211,102,0.42)] transition-transform duration-200 hover:scale-[1.04] hover:bg-[#20bd5a]"
    >
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className="h-7 w-7 shrink-0"
      >
        <path d="M16.001 3C9.376 3 4 8.373 4 15c0 2.393.703 4.62 1.912 6.49L4 29l7.69-1.877A11.93 11.93 0 0 0 16.001 27C22.627 27 28 21.627 28 15S22.627 3 16.001 3zm0 21.75c-2.02 0-3.906-.573-5.507-1.566l-.395-.235-4.564 1.114 1.157-4.44-.257-.408A9.71 9.71 0 0 1 5.25 15c0-5.936 4.815-10.75 10.751-10.75 5.935 0 10.75 4.814 10.75 10.75S21.936 24.75 16.001 24.75zm5.895-8.05c-.323-.162-1.912-.943-2.208-1.05-.296-.108-.512-.162-.727.162-.216.323-.836 1.05-1.025 1.267-.188.216-.377.243-.7.081-.323-.162-1.364-.503-2.598-1.603-.96-.856-1.609-1.914-1.797-2.237-.188-.323-.02-.497.142-.658.146-.145.324-.377.485-.566.162-.19.216-.323.324-.539.108-.216.054-.404-.027-.566-.081-.162-.727-1.752-.996-2.4-.262-.63-.529-.545-.727-.555-.188-.009-.404-.011-.62-.011-.216 0-.566.081-.862.404-.296.323-1.13 1.104-1.13 2.693 0 1.589 1.157 3.124 1.318 3.34.162.216 2.278 3.477 5.519 4.875.771.333 1.372.532 1.841.68.774.246 1.478.211 2.035.128.621-.093 1.912-.782 2.182-1.537.27-.755.27-1.402.189-1.537-.081-.135-.297-.216-.62-.378z" />
      </svg>
      <span className="pr-1 font-display text-sm font-bold tracking-wide text-white">
        Chat on WhatsApp
      </span>
    </motion.a>
  );
}
