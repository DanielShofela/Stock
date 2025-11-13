import React, { useState, useCallback, useEffect } from 'react';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsListPage from './pages/ProductsListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AddStockMovementPage from './pages/AddStockMovementPage';
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';
import ReportsPage from './pages/ReportsPage';
import OrdersPage from './pages/OrdersPage';
import AddOrderPage from './pages/AddOrderPage';
import AccountPage from './pages/AccountPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav';
import WalkthroughGuide, { type Step as WalkthroughStep } from './components/WalkthroughGuide';
import LoadingSpinner from './components/LoadingSpinner';
import type { Product, StockMovement, Warehouse, Customer, Order, Profile } from './types';

export type Page = 'dashboard' | 'products' | 'reports' | 'add-stock' | 'product-detail' | 'add-product' | 'edit-product' | 'orders' | 'add-order' | 'account';

const walkthroughSteps: (WalkthroughStep & { page?: Page })[] = [
  {
    title: "Bienvenue sur A-Cosmetic Stock !",
    text: "Suivez ce petit guide pour découvrir les fonctionnalités principales de votre nouvelle application de gestion.",
    position: 'center',
  },
  {
    title: "Tableau de bord",
    targetId: 'dashboard-page',
    text: "Ici, vous aurez une vue d'ensemble de vos stocks critiques et des mouvements récents.",
    position: 'bottom',
    page: 'dashboard',
  },
  {
    title: "Catalogue Produits",
    targetId: 'products-nav-item',
    text: "Cliquez ici pour voir, ajouter ou gérer tous vos produits et leurs variantes.",
    position: 'top',
    page: 'products',
  },
  {
    title: "Gestion des Commandes",
    targetId: 'orders-nav-item',
    text: "Suivez et gérez les commandes de vos clients depuis cet écran.",
    position: 'top',
    page: 'orders',
  },
   {
    title: "Ajouter un Produit",
    targetId: 'add-product-button',
    text: "C'est ici que vous commencez ! Cliquez pour ajouter votre premier produit et initialiser son stock.",
    position: 'bottom',
    page: 'products',
  },
  {
    title: "Rapports & Exports",
    targetId: 'reports-nav-item',
    text: "Consultez les rapports de performance et exportez vos données en format CSV ou PDF.",
    position: 'top',
    page: 'reports',
  },
  {
    title: "Votre Compte",
    targetId: 'account-nav-item',
    text: "Gérez les informations de votre compte et déconnectez-vous en toute sécurité depuis cet écran.",
    position: 'top',
    page: 'dashboard',
  },
  {
    title: "Action Rapide",
    targetId: 'add-stock-button',
    text: "Utilisez ce bouton pour ajouter rapidement une entrée ou une sortie de stock.",
    position: 'top',
  },
  {
    title: "Vous êtes prêt !",
    text: "Vous avez maintenant les bases. Explorez l'application pour découvrir le reste. Bonnes ventes !",
    position: 'center',
  }
];


const App: React.FC = () => {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-700 mb-3">Erreur de Configuration</h1>
          <p className="text-gray-800">
            La connexion à la base de données Supabase n'est pas correctement configurée.
          </p>
          <p className="text-sm text-gray-600 mt-4">
            Veuillez vous assurer que les variables d'environnement <code className="bg-red-100 text-red-800 px-1 py-0.5 rounded">SUPABASE_URL</code> et <code className="bg-red-100 text-red-800 px-1 py-0.5 rounded">SUPABASE_KEY</code> sont définies avec vos identifiants de projet Supabase.
          </p>
        </div>
      </div>
    );
  }

  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [authEvent, setAuthEvent] = useState<AuthChangeEvent | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  // --- AUTH & DATA FETCHING ---
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error("Error fetching profile:", error.message);
        setProfile(null);
    } else {
        setProfile(data as Profile);
    }
    return data;
  };

  useEffect(() => {
    const setup = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
            await fetchProfile(session.user.id);
        } else {
            setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setAuthEvent(_event);
            
            if (_event === 'PASSWORD_RECOVERY') {
                return; // Wait for the user to set a new password
            }

            if (session) {
                setLoading(true);
                await fetchProfile(session.user.id);
                // The loading state will be set to false in the useEffect that depends on the session.
            } else {
                setProfile(null);
                setAuthEvent(null);
                setLoading(false); // No user, so stop loading
            }
        });

        return () => subscription.unsubscribe();
    };
    setup();
  }, []);

  useEffect(() => {
    if (session) {
      fetchInitialData();
    }
    // Show walkthrough if user is logged in, has a profile, and hasn't completed it.
    if (profile && !profile.walkthrough_completed) {
      setShowWalkthrough(true);
    } else {
      // Hide if there's no profile or if it's already completed.
      setShowWalkthrough(false);
    }
  }, [session, profile]);

  const seedDatabase = async () => {
    if (!session?.user || warehouses.length === 0) return;
    console.log("Database is empty, seeding initial data...");

    const userId = session.user.id;
    const userEmail = session.user.email || 'system';
    const warehouseId = warehouses[0].id;

    // 2. Seed Products and Variants
    const productsToSeed = [
        {
            user_id: userId, name: 'Sérum Éclat Vitamine C', sku: 'SER-VITC', category: 'Sérums', images: ['https://placehold.co/400x400/FFF0E5/FF6B00?text=Sérum'],
            created_by: userEmail, last_modified_by: userEmail,
            variants: [
                { variant_name: '30ml', price: 3500, barcode: '370000000001', initial_quantity: 50, safety_stock: 10 },
                { variant_name: '50ml', price: 5200, barcode: '370000000002', initial_quantity: 30, safety_stock: 5 },
            ]
        },
        {
            user_id: userId, name: 'Crème Hydratante Intense', sku: 'CRM-HYD', category: 'Crèmes', images: ['https://placehold.co/400x400/E5F4FF/0076BC?text=Crème'],
            created_by: userEmail, last_modified_by: userEmail,
            variants: [
                { variant_name: '50ml', price: 2800, barcode: '370000000003', initial_quantity: 100, safety_stock: 20 },
            ]
        },
        {
            user_id: userId, name: 'Masque Purifiant Argile', sku: 'MSQ-ARG', category: 'Masques', images: ['https://placehold.co/400x400/E8F5E9/4CAF50?text=Masque'],
            created_by: userEmail, last_modified_by: userEmail,
            variants: [
                { variant_name: '75ml', price: 2200, barcode: '370000000004', initial_quantity: 75, safety_stock: 15 },
            ]
        },
    ];

    for (const p of productsToSeed) {
        const { variants, ...productData } = p;
        const { data: newProduct, error: productError } = await supabase.from('products').insert(productData).select().single();
        if (productError || !newProduct) { console.error('Error seeding product', p.name, productError); continue; }
        
        const variantInserts = variants.map(v => ({
            product_id: newProduct.id,
            variant_name: v.variant_name,
            price: v.price,
            barcode: v.barcode,
        }));
        const { data: newVariants, error: variantError } = await supabase.from('product_variants').insert(variantInserts).select();
        if (variantError || !newVariants) { console.error('Error seeding variants for', p.name, variantError); continue; }

        const stockLevelInserts = variants.map((v, i) => ({
            variant_id: newVariants[i].id,
            warehouse_id: warehouseId,
            quantity: v.initial_quantity,
            initial_quantity: v.initial_quantity,
            safety_stock: v.safety_stock,
            user_id: userId,
        }));
        await supabase.from('stock_levels').insert(stockLevelInserts);

        const movementInserts = variants.map((v, i) => ({
            variant_id: newVariants[i].id,
            warehouse_id: warehouseId,
            quantity: v.initial_quantity,
            movement_type: 'in' as const,
            reference: 'Stock initial',
            user_id: userId,
            product_name_cache: newProduct.name,
            variant_name_cache: v.variant_name,
            sku_cache: newProduct.sku,
            user_email_cache: userEmail,
        }));
        await supabase.from('stock_movements').insert(movementInserts);
    }
    console.log("Finished seeding products.");
  }


  const fetchInitialData = async () => {
    if (products.length > 0 && !loading) return; // Prevent re-fetching if data is already there
    setLoading(true);
    await fetchWarehouses(); // Must run first

    const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
    if (count === 0 && !error) {
      await seedDatabase();
    }

    await Promise.all([
      fetchProductsAndStock(),
      fetchMovements(),
      fetchCustomers(),
      fetchOrders(),
    ]);
    setLoading(false);
  };

  const fetchWarehouses = async () => {
    if (!session?.user) return;
    
    const { data, error } = await supabase.from('warehouses').select('*');
    
    if (error) {
        console.error('Error fetching warehouses:', error.message);
        setWarehouses([]);
        return;
    }

    if (data && data.length === 0) {
        const { data: newWarehouse, error: createError } = await supabase
            .from('warehouses')
            .insert({ user_id: session.user.id, name: 'Entrepôt Principal', location: 'Non spécifié' })
            .select()
            .single();

        if (createError) {
            console.error('Failed to create default warehouse:', createError.message);
            setWarehouses([]);
        } else if (newWarehouse) {
            setWarehouses([newWarehouse]);
        }
    } else {
        setWarehouses(data || []);
    }
  };
  
  const fetchProductsAndStock = async (): Promise<Product[] | undefined> => {
    const { data: productsData, error: productsError } = await supabase
       .from('products')
       .select(`
           *,
           product_variants (
               *,
               stock_levels (*)
           )
       `);

   if (productsError) {
     console.error('Error fetching products', productsError.message);
     return;
   }

   const formattedProducts: Product[] = productsData.map((p: any) => ({
       id: p.id,
       name: p.name,
       sku: p.sku,
       description: p.description,
       category: p.category,
       images: Array.isArray(p.images) ? p.images.filter((img): img is string => typeof img === 'string') : [],
       created_by: p.created_by,
       last_modified_by: p.last_modified_by,
       variants: p.product_variants.map((v: any) => {
           return {
               id: v.id,
               variant_name: v.variant_name,
               barcode: v.barcode,
               price: v.price || 0,
               // Detailed stats (total_received, etc.) will be fetched on the product detail page
               stock_levels: v.stock_levels.map((sl: any) => ({
                   warehouse_id: sl.warehouse_id,
                   warehouse_name: warehouses.find(w => w.id === sl.warehouse_id)?.name || 'Unknown',
                   quantity: sl.quantity || 0,
                   safety_stock: sl.safety_stock || 0,
                   initial_quantity: sl.initial_quantity || 0,
                   last_modified: sl.last_modified || new Date().toISOString()
               }))
           };
       })
   }));
   setProducts(formattedProducts);
   return formattedProducts;
 };
  
  const fetchMovements = async () => {
     const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
    if (error) console.error('Error fetching movements', error.message);
    else {
        const formattedMovements: StockMovement[] = data.map(m => ({
            id: m.id,
            productName: m.product_name_cache || 'N/A',
            variantName: m.variant_name_cache || 'N/A',
            sku: m.sku_cache,
            quantity: m.quantity,
            type: m.movement_type,
            date: m.created_at || new Date().toISOString(),
            reference: m.reference,
            userEmail: m.user_email_cache,
        }));
        setStockMovements(formattedMovements);
    }
  };
  
    const fetchCustomers = async () => {
        const { data, error } = await supabase.from('customers').select('*');
        if (error) {
            console.error('Error fetching customers', error.message);
        } else {
            setCustomers(data || []);
        }
    };

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('order_date', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error.message);
        } else {
            const formattedOrders: Order[] = data.map(o => ({
                id: o.id,
                customer_id: o.customer_id,
                customer_name: o.customer_name,
                order_date: o.order_date,
                total_amount: o.total_amount,
                status: o.status,
                created_by_user_email: o.created_by_user_email,
                items: o.order_items.map((item: any) => ({
                    id: item.id,
                    order_id: item.order_id,
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    price: item.price,
                })),
            }));
            setOrders(formattedOrders);
        }
    };


  // --- REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    if (!session) return;
    
    const changes = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_movements' }, (payload) => {
        fetchMovements();
        fetchProductsAndStock();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        fetchProductsAndStock();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, (payload) => {
        fetchProductsAndStock();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_levels' }, (payload) => {
        fetchProductsAndStock();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        fetchOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, (payload) => {
        fetchCustomers();
      })
      .subscribe()
    
      return () => {
        supabase.removeChannel(changes);
      }
  }, [session, supabase]);


  // --- WALKTHROUGH ---
  const handleNextStep = () => {
    const nextStepIndex = walkthroughStep + 1;
    const nextStep = walkthroughSteps[nextStepIndex];
    if (nextStep?.page && nextStep.page !== currentPage) {
        setCurrentPage(nextStep.page);
    }
    setWalkthroughStep(nextStepIndex);
  };
  const handleEndWalkthrough = async () => {
    setShowWalkthrough(false);
    if (session?.user) {
        const { error } = await supabase
            .from('profiles')
            .update({ walkthrough_completed: true })
            .eq('id', session.user.id);

        if (error) {
            console.error("Error updating walkthrough status:", error.message);
        } else {
            // Update profile in local state to reflect change immediately
            setProfile(prevProfile => prevProfile ? { ...prevProfile, walkthrough_completed: true } : null);
        }
    }
  };

  // --- NAVIGATION & UI HANDLERS ---
  const handleNavigate = useCallback((page: Page) => setCurrentPage(page), []);
  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
  }, []);
  const handleBackToList = useCallback(() => {
    setSelectedProduct(null);
    setProductToEdit(null);
    setCurrentPage('products');
  }, []);


  // --- CRUD OPERATIONS ---
 const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    if (!session?.user?.email) return;
    const { name, sku, description, category, images, variants } = newProduct;

    const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({ 
            user_id: session.user.id, 
            name, 
            sku, 
            description, 
            category, 
            images,
            created_by: session.user.email,
            last_modified_by: session.user.email,
        })
        .select()
        .single();
    if (productError || !productData) {
        console.error('Error creating product:', productError?.message);
        return;
    }

    const variantInserts = variants.map(v => ({
        product_id: productData.id,
        variant_name: v.variant_name,
        price: v.price,
        barcode: v.barcode
    }));
    const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantInserts)
        .select();
    if (variantsError || !variantsData) {
        console.error('Error creating variants:', variantsError?.message);
        return;
    }

    const stockLevelInserts = variants.flatMap((v, index) => 
        v.stock_levels.map(sl => ({
            variant_id: variantsData[index].id,
            warehouse_id: sl.warehouse_id,
            quantity: sl.quantity,
            initial_quantity: sl.quantity,
            safety_stock: sl.safety_stock,
            user_id: session.user.id
        }))
    );
     const { error: stockLevelError } = await supabase.from('stock_levels').insert(stockLevelInserts);
     if (stockLevelError) console.error('Error creating stock levels', stockLevelError.message);

    const movementInserts = variants.flatMap((v, index) => 
        v.stock_levels.map(sl => ({
            variant_id: variantsData[index].id,
            warehouse_id: sl.warehouse_id,
            quantity: sl.quantity,
            movement_type: 'in' as const,
            reference: 'Stock initial',
            user_id: session.user.id,
            product_name_cache: name,
            variant_name_cache: v.variant_name,
            sku_cache: sku,
            user_email_cache: session.user.email,
        }))
    ).filter(m => m.quantity > 0);

    if (movementInserts.length > 0) {
        const { error: movementsError } = await supabase.from('stock_movements').insert(movementInserts);
        if (movementsError) console.error('Error creating initial movements', movementsError.message);
    }
    
    await fetchProductsAndStock(); // Refresh product list
    setCurrentPage('products');
  };
  
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setCurrentPage('edit-product');
  };

  const handleDeleteProduct = async (productId: number) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    
    if (error) {
        console.error("Error deleting product:", error.message);
    } else {
        await fetchProductsAndStock();
        setCurrentPage('products');
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    if (!session?.user?.email) return;
    const { variants, ...productInfo } = updatedProduct;

    const { error: productError } = await supabase
        .from('products')
        .update({
            name: productInfo.name,
            sku: productInfo.sku,
            description: productInfo.description,
            category: productInfo.category,
            images: productInfo.images,
            last_modified_by: session.user.email,
        })
        .eq('id', productInfo.id);

    if (productError) {
        console.error("Error updating product:", productError.message);
        return;
    }

    const updatePromises = variants.map(variant =>
        supabase
            .from('product_variants')
            .update({
                variant_name: variant.variant_name,
                price: variant.price,
                barcode: variant.barcode
            })
            .eq('id', variant.id)
    );

    await Promise.all(updatePromises);
    
    const refreshedProductList = await fetchProductsAndStock();
    
    // Find the fully updated product from the refreshed list to update the detail view
    const fullyUpdatedProduct = (refreshedProductList || products).find(p => p.id === updatedProduct.id) || updatedProduct;

    setSelectedProduct(fullyUpdatedProduct);
    setCurrentPage('product-detail');
  };

  const handleAddStockMovement = async (movement: { variantId: number, warehouseId: number, quantity: number, type: 'in' | 'out' | 'adjustment' | 'damaged' | 'sale', reference: string }) => {
     if (!session?.user?.email) return;
     const { variantId, warehouseId, quantity, type, reference } = movement;

    const { data: stockLevel, error: fetchError } = await supabase
        .from('stock_levels')
        .select('quantity')
        .eq('variant_id', variantId)
        .eq('warehouse_id', warehouseId)
        .single();
    if (fetchError) {
        console.error('Error fetching stock level:', fetchError.message);
        return;
    }
    
    const newQuantity = (stockLevel.quantity || 0) + quantity;
    const { error: updateError } = await supabase
        .from('stock_levels')
        .update({ quantity: newQuantity, last_modified: new Date().toISOString() })
        .eq('variant_id', variantId)
        .eq('warehouse_id', warehouseId);
    if (updateError) {
        console.error('Error updating stock level:', updateError.message);
        return;
    }
    
    const productInfo = products.find(p => p.variants.some(v => v.id === variantId));
    const variantInfo = productInfo?.variants.find(v => v.id === variantId);

    const { error: insertError } = await supabase
        .from('stock_movements')
        .insert({
            variant_id: variantId,
            warehouse_id: warehouseId,
            quantity: quantity,
            movement_type: type,
            reference,
            user_id: session.user.id,
            product_name_cache: productInfo?.name,
            variant_name_cache: variantInfo?.variant_name,
            sku_cache: productInfo?.sku,
            user_email_cache: session.user.email,
        });
    if (insertError) console.error('Error logging movement:', insertError.message);

    await Promise.all([fetchProductsAndStock(), fetchMovements()]);
  };
  
    const handleAddOrder = async (order: { customerName: string; items: { variantId: number; quantity: number; price: number }[]; total: number }) => {
        if (!session?.user?.email || warehouses.length === 0) return;
        const { customerName, items, total } = order;

        // 1. Find or create customer
        let customer: Customer | null = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase()) || null;
        if (!customer) {
            const { data: newCustomer, error: customerError } = await supabase
                .from('customers')
                .insert({ name: customerName, user_id: session.user.id })
                .select()
                .single();
            if (customerError || !newCustomer) {
                console.error('Error creating customer:', customerError?.message);
                return;
            }
            customer = newCustomer;
            setCustomers(prev => [...prev, newCustomer]);
        }

        // 2. Insert the order
        const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_id: customer.id,
                customer_name: customer.name,
                total_amount: total,
                status: 'completed',
                user_id: session.user.id,
                created_by_user_email: session.user.email,
            })
            .select()
            .single();

        if (orderError || !newOrder) {
            console.error('Error creating order:', orderError?.message);
            return;
        }

        // 3. Insert order items
        const orderItems = items.map(item => ({
            order_id: newOrder.id,
            variant_id: item.variantId,
            quantity: item.quantity,
            price: item.price,
        }));
        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) {
            console.error('Error creating order items:', itemsError?.message);
            return;
        }

        // 4. Update stock levels and create movements
        const warehouseId = warehouses[0].id; 
        for (const item of items) {
           await handleAddStockMovement({
                variantId: item.variantId,
                warehouseId: warehouseId,
                quantity: -item.quantity,
                type: 'sale',
                reference: `Commande #${newOrder.id}`
           });
        }
        
        await fetchOrders();
        setCurrentPage('orders');
    };

  // --- PAGE RENDERING ---
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage products={products} stockMovements={stockMovements} profile={profile} />;
      case 'products':
        return <ProductsListPage products={products} onSelectProduct={handleSelectProduct} onAddClick={() => handleNavigate('add-product')} />;
      case 'product-detail':
        return selectedProduct ? <ProductDetailPage product={selectedProduct} onBack={handleBackToList} onAddMovement={handleAddStockMovement} warehouses={warehouses} onEdit={handleEditProduct} onDelete={handleDeleteProduct} /> : <ProductsListPage products={products} onSelectProduct={handleSelectProduct} onAddClick={() => handleNavigate('add-product')}/>;
      case 'add-stock':
        return <AddStockMovementPage products={products} warehouses={warehouses} onAddMovement={handleAddStockMovement} onBack={() => handleNavigate('dashboard')} />;
      case 'add-product':
        return <AddProductPage onAddProduct={handleAddProduct} warehouses={warehouses} onBack={() => handleNavigate('products')} />;
      case 'edit-product':
        return productToEdit ? <EditProductPage product={productToEdit} onUpdateProduct={handleUpdateProduct} onBack={handleBackToList} /> : <ProductsListPage products={products} onSelectProduct={handleSelectProduct} onAddClick={() => handleNavigate('add-product')} />;
      case 'reports':
        return <ReportsPage />;
      case 'orders':
        return <OrdersPage orders={orders} onNavigate={handleNavigate} />;
      case 'add-order':
        return <AddOrderPage products={products} customers={customers} onAddOrder={handleAddOrder} onBack={() => handleNavigate('orders')} />;
      case 'account':
        return <AccountPage session={session} profile={profile} onNavigate={handleNavigate} />;
      default:
        return <DashboardPage products={products} stockMovements={stockMovements} profile={profile} />;
    }
  };

  if (session && authEvent === 'PASSWORD_RECOVERY') {
    return <ResetPasswordPage onSuccess={() => setAuthEvent(null)} />;
  }

  if (!session) {
    return <LoginPage selectedRole="manager" />;
  }
  
  if (loading) {
      return (
        <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-[10000]">
          <LoadingSpinner />
          <p className="mt-4 text-lg font-semibold text-gray-700">Chargement de vos données...</p>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50">
       {showWalkthrough && (
          <WalkthroughGuide
              stepConfig={walkthroughSteps[walkthroughStep]}
              isLastStep={walkthroughStep === walkthroughSteps.length - 1}
              onNext={handleNextStep}
              onSkip={handleEndWalkthrough}
              onDone={handleEndWalkthrough}
           />
      )}
      
      <div className="md:flex">
          <SideNav currentPage={currentPage} onNavigate={handleNavigate} profile={profile} />
          <main className="flex-1 pb-20 md:pb-0">
              {renderPage()}
          </main>
      </div>

      <div className="md:hidden">
          <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

export default App;
