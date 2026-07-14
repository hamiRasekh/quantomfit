export const adminOrderProcessService = {
  async getOrderItemCanvas(orderId: string, itemId: string) {
    return null;
  },
  async getOrderNotes(orderId: string, itemId?: string) {
    return { data: [], total: 0 };
  },
  async createOrderNote(data: any) {
    return { id: '', ...data };
  },
  async deleteOrderNote(noteId: string) {
    // TODO: Implement delete functionality
    return Promise.resolve();
  },
};

