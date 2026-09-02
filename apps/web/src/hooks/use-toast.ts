import { toast as sonnerToast } from 'sonner';

export function useToast() {
  return {
    toast: (options: { title: string; description?: string }) => {
      sonnerToast(options.title, {
        description: options.description,
      });
    },
  };
}
