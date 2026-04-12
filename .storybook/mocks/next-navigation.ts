import { action } from "@storybook/addon-actions";

export function useRouter() {
  return {
    back: action("router.back"),
    forward: action("router.forward"),
    push: action("router.push"),
    replace: action("router.replace"),
    refresh: action("router.refresh"),
    prefetch: action("router.prefetch"),
  };
}

export function usePathname() {
  return "/";
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function useParams() {
  return {};
}
