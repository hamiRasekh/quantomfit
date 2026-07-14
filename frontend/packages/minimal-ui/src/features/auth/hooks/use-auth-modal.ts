type AuthModalState = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

function createAuthModal() {
  let isOpen = false;
  const listeners: Array<() => void> = [];

  return {
    getState() {
      return {
        isOpen,
        openModal: () => {
          isOpen = true;
          listeners.forEach((listener) => listener());
        },
        closeModal: () => {
          isOpen = false;
          listeners.forEach((listener) => listener());
        },
      };
    },
    subscribe(listener: () => void) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
  };
}

export const useAuthModal = createAuthModal();

