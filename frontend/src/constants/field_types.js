export const FIELD_TYPES = {
    products: {
      name: 'text',
      description: 'textarea',
      price: 'number',
      quantity: 'number',
      image_name: 'text',
      date_product: 'text',
      manufacturer_id: 'number',
      category_id: 'number'
    },
    users: {
      first_name: 'text',
      last_name: 'text',
      email: 'email',
      hashed_password: 'text',
      phone_number: 'text',
      address: 'textarea',
      role_id: 'number'
    },
    product_info: {
      product_id: 'number',
      composition: 'textarea',
      pharmacological_action: 'textarea',
      indications: 'textarea',
      contraindications: 'textarea',
      side_effects: 'textarea',
      interactions: 'textarea',
      dosage: 'textarea',
      overdose: 'textarea',
      full_description: 'textarea',
      storage_conditions: 'textarea',
      shelf_life: 'textarea'
    },
    cart_items: {
      user_id: 'number',
      product_id: 'number',
      product_name: 'text',
      price: 'number',
      quantity: 'number',
      total_price: 'number'
    },
    favorites: {
      user_id: 'number',
      product_id: 'number'
    },
    orders: {
      user_id: 'number',
      order_total: 'number'
    },
    order_details: {
      order_id: 'number',
      product_id: 'number',
      quantity: 'number'
    },
    supplies: {
      total_cost: 'number',
      manufacturer_id: 'number'
    },
    supply_items: {
      supply_id: 'number',
      product_id: 'number',
      quantity: 'number',
      cost: 'number'
    },
    manufacturers: {
      manufacturer_name: 'text',
      address: 'textarea',
      phone_number: 'text',
      inn: 'text',
      kpp: 'text',
      account_number: 'text'
    },
    categories: {
      category_name: 'text'
    },
    roles: {
      name: 'text',
      permissions: 'textarea'
    }
  };