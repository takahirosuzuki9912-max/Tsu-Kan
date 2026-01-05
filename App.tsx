import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import { 
  PlusCircle, 
  MinusCircle, 
  Calendar, 
  Package, 
  FileText, 
  TrendingUp, 
  List,
  Trash2,
  Save,
  DollarSign,
  Settings,
  ShieldCheck,
  UserCircle,
  Edit3,
  Lock,
  LogOut
} from 'lucide-react';

// --- Firebase Configuration ---
// ★重要★: ここの設定をご自身のFirebaseのものに書き換えてください
const firebaseConfig = {
  apiKey: "AIzaSyCs_caRUymWCM-ZJqb3RUayy10ZYNw6S2E",
  authDomain: "hs-tsu-kan.firebaseapp.com",
  projectId: "hs-tsu-kan",
  storageBucket: "hs-tsu-kan.firebasestorage.app",
  messagingSenderId: "254611067252",
  appId: "1:254611067252:web:30bc519997efe0d0455c21"
}; 
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Types ---
type TransactionType = 'in' | 'out';

interface Transaction {
  id: string;
  date: string; 
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  timestamp: any;
  workerId?: string;
}

interface Product {
  id: string;
  name: string;
}

// --- Helper Functions ---
const formatFlowValue = (val: number) => {
  if (val === 0) return '';
  if (val < 0) return `▲${Math.abs(val)}`;
  return val;
};

const formatCurrency = (val: number) => {
  return `¥${val.toLocaleString()}`;
};

// --- Login Component (新規追加) ---
const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      // エラーメッセージの日本語化
      if (err.code === 'auth/invalid-email') setError('メールアドレスの形式が正しくありません。');
      else if (err.code === 'auth/user-disabled') setError('このユーザーは無効化されています。');
      else if (err.code === 'auth/user-not-found') setError('ユーザーが見つかりません。');
      else if (err.code === 'auth/wrong-password') setError('パスワードが間違っています。');
      else if (err.code === 'auth/email-already-in-use') setError('このメールアドレスは既に使用されています。');
      else if (err.code === 'auth/weak-password') setError('パスワードは6文字以上で入力してください。');
      else if (err.code === 'auth/invalid-credential') setError('メールアドレスまたはパスワードが違います。');
      else setError('エラーが発生しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-4 border-blue-50">
        <div className="flex justify-center mb-6 text-blue-600">
          <div className="bg-blue-100 p-4 rounded-full">
            <Lock size={48} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {isLogin ? '在庫管理システム' : '新規アカウント登録'}
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          {isLogin ? 'メールアドレスとパスワードを入力してください' : '管理者用のアカウントを作成します'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-200 font-bold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">メールアドレス</label>
            <input 
              type="email" 
              required 
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">パスワード</label>
            <input 
              type="password" 
              required 
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg"
              placeholder="6文字以上"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:bg-blue-300 text-lg"
          >
            {loading ? '処理中...' : (isLogin ? 'ログイン' : '登録する')}
          </button>
        </form>

        <div className="mt-8 text-center border-t pt-6">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm text-blue-600 hover:text-blue-800 font-bold underline"
          >
            {isLogin ? '初めての方はこちら（新規登録）' : 'ログイン画面に戻る'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function InventoryApp() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'input' | 'flow' | 'stock' | 'max' | 'products'>('input');
  
  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Global Settings State
  const [globalUnitPrice, setGlobalUnitPrice] = useState<number>(400);
  const [isUnitPriceEditing, setIsUnitPriceEditing] = useState(false);
  const [tempUnitPrice, setTempUnitPrice] = useState<number>(400);

  // Input Form State
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [inputType, setInputType] = useState<TransactionType>('in');
  const [inputQuantity, setInputQuantity] = useState<number>(1);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  // Product Management
  const [newProductName, setNewProductName] = useState('');

  // --- Auth Check ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Real-time Data Sync ---
  useEffect(() => {
    if (!user) return;

    // 1. Transactions
    const qTrans = query(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'));
    const unsubTrans = onSnapshot(qTrans, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
      data.sort((a, b) => {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          const tA = a.timestamp?.seconds || 0;
          const tB = b.timestamp?.seconds || 0;
          return tB - tA;
      });
      setTransactions(data);
    });

    // 2. Products
    const qProd = query(collection(db, 'artifacts', appId, 'public', 'data', 'products'));
    const unsubProd = onSnapshot(qProd, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })) as Product[];
      data.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
      setProducts(data);
      
      if (data.length > 0 && !selectedProduct) {
          setSelectedProduct(prev => prev || data[0].id);
      }
    });

    // 3. Global Settings (Unit Price)
    const settingsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
    const unsubSettings = onSnapshot(settingsDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.unitPrice !== undefined) {
                setGlobalUnitPrice(data.unitPrice);
                if (!isUnitPriceEditing) setTempUnitPrice(data.unitPrice);
            }
        } else {
            setDoc(settingsDocRef, { unitPrice: 400 });
        }
    });

    return () => { unsubTrans(); unsubProd(); unsubSettings(); };
  }, [user, isUnitPriceEditing]);

  // --- Logic Functions ---

  const handleSignOut = () => {
    if(confirm('ログアウトしますか？')) {
        signOut(auth);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProduct) return;
    setSubmitStatus('saving');
    const product = products.find(p => p.id === selectedProduct);

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), {
        date: inputDate,
        productId: selectedProduct,
        productName: product?.name || 'Unknown',
        type: inputType,
        quantity: Number(inputQuantity),
        timestamp: serverTimestamp(),
        workerId: user.uid
      });
      setSubmitStatus('success');
      setInputQuantity(1);
      setTimeout(() => setSubmitStatus('idle'), 2000);
    } catch (error) {
      console.error(error);
      alert("保存エラー");
      setSubmitStatus('idle');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), {
        name: newProductName.trim(),
        created: serverTimestamp()
    });
    setNewProductName('');
    alert("商品を追加しました");
  };

  // 商品削除機能
  const handleDeleteProduct = async (id: string, name: string) => {
      if(!confirm(`商品「${name}」を本当に削除しますか？\n\n※注意: これまでの入出庫履歴は残りますが、商品の選択肢からは消えます。`)) return;
      
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id));
      } catch (err) {
        console.error(err);
        alert("削除に失敗しました");
      }
  };

  const handleDeleteTransaction = async (id: string) => {
    if(!confirm("この履歴を削除しますか？")) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', id));
  };

  const saveUnitPrice = async () => {
      try {
          const settingsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
          await setDoc(settingsDocRef, { unitPrice: Number(tempUnitPrice) }, { merge: true });
          setIsUnitPriceEditing(false);
          setGlobalUnitPrice(Number(tempUnitPrice));
          alert("単価を更新しました");
      } catch (err) {
          console.error(err);
          alert("単価の保存に失敗しました");
      }
  };

  // --- Matrix Logic ---
  const matrixData = useMemo(() => {
    const dateSet = new Set(transactions.map(t => t.date));
    const dates = Array.from(dateSet).sort();

    const flowMap: Record<string, Record<string, number>> = {};
    const stockMap: Record<string, Record<string, number>> = {};
    
    dates.forEach(d => {
        flowMap[d] = {};
        products.forEach(p => flowMap[d][p.id] = 0);
    });

    transactions.forEach(t => {
        if (!flowMap[t.date]) flowMap[t.date] = {};
        if (flowMap[t.date][t.productId] === undefined) flowMap[t.date][t.productId] = 0;
        
        if (t.type === 'in') {
            flowMap[t.date][t.productId] += t.quantity;
        } else {
            flowMap[t.date][t.productId] -= t.quantity;
        }
    });

    let currentStock: Record<string, number> = {};
    products.forEach(p => currentStock[p.id] = 0);

    dates.forEach(d => {
        stockMap[d] = {};
        products.forEach(p => {
            const dailyNet = flowMap[d][p.id] || 0;
            currentStock[p.id] += dailyNet;
            stockMap[d][p.id] = currentStock[p.id];
        });
    });

    return { dates, flowMap, stockMap, currentStock };
  }, [transactions, products]);


  // --- Invoice Logic ---
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [reportDate, setReportDate] = useState({ year: currentYear, month: currentMonth });

  const maxStockData = useMemo(() => {
    const term1Start = 1; const term1End = 10;
    const term2Start = 11; const term2End = 20;
    const targetPrefix = `${reportDate.year}-${String(reportDate.month).padStart(2, '0')}`;
    const daysInMonth = new Date(reportDate.year, reportDate.month, 0).getDate();
    
    const result: Record<string, { term1: number, term2: number, term3: number }> = {};
    products.forEach(p => { 
        result[p.id] = { term1: 0, term2: 0, term3: 0 }; 
    });

    let lastKnownStock: Record<string, number> = {};
    products.forEach(p => lastKnownStock[p.id] = 0);

    const historyDates = matrixData.dates;
    const firstDayOfMonth = `${targetPrefix}-01`;
    const prevDates = historyDates.filter(d => d < firstDayOfMonth);
    
    if (prevDates.length > 0) {
        const lastDate = prevDates[prevDates.length - 1];
        if (matrixData.stockMap[lastDate]) {
            lastKnownStock = { ...matrixData.stockMap[lastDate] };
        }
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${targetPrefix}-${String(d).padStart(2, '0')}`;
        if (matrixData.stockMap[dateStr]) {
            lastKnownStock = { ...matrixData.stockMap[dateStr] };
        }
        
        products.forEach(p => {
            const qty = lastKnownStock[p.id] || 0;
            if (d >= term1Start && d <= term1End) result[p.id].term1 = Math.max(result[p.id].term1, qty);
            else if (d >= term2Start && d <= term2End) result[p.id].term2 = Math.max(result[p.id].term2, qty);
            else result[p.id].term3 = Math.max(result[p.id].term3, qty);
        });
    }
    return result;
  }, [reportDate, matrixData, products]);

  const invoiceTotal = useMemo(() => {
      let total = 0;
      products.forEach(p => {
          const d = maxStockData[p.id];
          const sumQty = d.term1 + d.term2 + d.term3;
          total += sumQty * globalUnitPrice;
      });
      return total;
  }, [maxStockData, products, globalUnitPrice]);

  // --- Render ---
  if (authLoading) return <div className="flex h-screen items-center justify-center text-blue-600 font-bold">起動中...</div>;
  
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-800">
      
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Package size={24} />
          在庫管理
        </h1>
        <div className="flex items-center gap-2 opacity-90">
            <UserCircle size={20} />
            <span className="text-xs hidden sm:inline mr-2">{user.email}</span>
            <button 
                onClick={handleSignOut}
                className="bg-blue-800 hover:bg-blue-900 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
            >
                <LogOut size={16} />
                ログアウト
            </button>
        </div>
      </header>

      <main className="max-w-full mx-auto p-4">

        {/* INPUT TAB */}
        {activeTab === 'input' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in max-w-xl mx-auto border-4 border-blue-50">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-gray-800 border-b-4 border-blue-100 pb-4">
              <PlusCircle className="text-blue-600" size={32} />
              現場入力
            </h2>
            
            {products.length === 0 ? (
                <div className="text-center p-8 bg-yellow-50 rounded">
                    <p className="font-bold text-gray-600">商品がありません</p>
                    <p className="text-sm text-gray-500 mt-2 mb-4">まずは「商品」タブから商品を登録してください。</p>
                    <button onClick={() => setActiveTab('products')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">商品登録へ移動</button>
                </div>
            ) : (
                <form onSubmit={handleTransactionSubmit} className="space-y-8">
                    <div>
                        <label className="block text-2xl font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <Calendar className="text-blue-500" size={32} /> 日付
                        </label>
                        <input 
                            type="date" 
                            required 
                            value={inputDate} 
                            onChange={e => setInputDate(e.target.value)} 
                            className="w-full p-6 bg-blue-50 rounded-2xl text-6xl font-bold text-gray-900 border-4 border-blue-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-200 transition-all shadow-sm h-32" 
                        />
                    </div>

                    <div>
                        <label className="block text-2xl font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <Package className="text-blue-500" size={32} /> 商品
                        </label>
                        <div className="relative">
                            <select 
                                value={selectedProduct} 
                                onChange={e => setSelectedProduct(e.target.value)}
                                className="w-full p-6 bg-blue-50 rounded-2xl text-5xl font-bold text-gray-900 border-4 border-blue-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-200 transition-all appearance-none shadow-sm h-32"
                            >
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-none text-blue-400">
                                ▼
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-2xl font-bold text-gray-700 mb-3">区分</label>
                        <div className="grid grid-cols-2 gap-6">
                            <button type="button" onClick={() => setInputType('in')}
                                className={`p-8 rounded-2xl flex flex-col items-center gap-4 transition-all transform duration-200 ${inputType === 'in' ? 'bg-blue-600 text-white shadow-xl scale-105 ring-4 ring-blue-300' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                <PlusCircle size={64} />
                                <span className="font-bold text-3xl">入荷</span>
                            </button>
                            <button type="button" onClick={() => setInputType('out')}
                                className={`p-8 rounded-2xl flex flex-col items-center gap-4 transition-all transform duration-200 ${inputType === 'out' ? 'bg-red-500 text-white shadow-xl scale-105 ring-4 ring-red-300' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                <MinusCircle size={64} />
                                <span className="font-bold text-3xl">出荷</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-2xl font-bold text-gray-700 mb-3">数量</label>
                        <input 
                            type="number" 
                            min="1" 
                            required 
                            value={inputQuantity} 
                            onChange={e => setInputQuantity(Number(e.target.value))}
                            className="w-full p-6 bg-gray-50 rounded-2xl text-6xl text-center font-bold border-4 border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-200 transition-all shadow-inner h-32" 
                        />
                    </div>

                    <button type="submit" disabled={submitStatus === 'saving'}
                        className={`w-full py-8 rounded-2xl font-bold text-3xl shadow-xl flex items-center justify-center gap-4 text-white transition-all transform duration-200 ${submitStatus === 'success' ? 'bg-green-500 scale-95' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}>
                        {submitStatus === 'saving' ? '送信中...' : submitStatus === 'success' ? '完了！' : '記録する'}
                        <Save size={36} />
                    </button>
                </form>
            )}
          </div>
        )}

        {/* FLOW TAB */}
        {activeTab === 'flow' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
                <List className="text-blue-600" /> 入出庫 (入荷・出荷)
            </h2>
            <div className="overflow-x-auto pb-4">
                <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                    <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="p-3 border sticky left-0 bg-gray-100 z-10 w-40 shadow-sm">商品名 \ 日付</th>
                            {matrixData.dates.map(date => (
                                <th key={date} className="p-3 border text-center font-mono min-w-[100px]">{date}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="p-3 border font-bold sticky left-0 bg-white z-10 shadow-sm">{p.name}</td>
                                {matrixData.dates.map(date => {
                                    const val = matrixData.flowMap[date]?.[p.id] || 0;
                                    const formattedVal = formatFlowValue(val);
                                    return (
                                        <td key={date} className={`p-3 border text-center font-mono ${val < 0 ? 'text-red-600 font-bold' : val > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                                            {formattedVal}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {matrixData.dates.length === 0 && <p className="text-center p-8 text-gray-400">データがありません</p>}
            </div>
          </div>
        )}

        {/* STOCK TAB */}
        {activeTab === 'stock' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
                <TrendingUp className="text-blue-600" /> 在庫残高表 (累積)
            </h2>
            <div className="overflow-x-auto pb-4">
                <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                    <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="p-3 border sticky left-0 bg-gray-100 z-10 w-40 shadow-sm">商品名 \ 日付</th>
                            {matrixData.dates.map(date => (
                                <th key={date} className="p-3 border text-center font-mono min-w-[100px]">{date}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="p-3 border font-bold sticky left-0 bg-white z-10 shadow-sm">{p.name}</td>
                                {matrixData.dates.map(date => {
                                    const val = matrixData.stockMap[date]?.[p.id] || 0;
                                    return (
                                        <td key={date} className="p-3 border text-center font-mono font-bold text-gray-800">
                                            {val}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {matrixData.dates.length === 0 && <p className="text-center p-8 text-gray-400">データがありません</p>}
            </div>
          </div>
        )}

        {/* INVOICE TAB */}
        {activeTab === 'max' && (
           <div className="space-y-6 max-w-4xl mx-auto">
             <div className="bg-white p-4 rounded-xl shadow flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <label className="font-bold text-gray-700">請求月:</label>
                    <input type="month" className="border rounded p-2 text-lg"
                        value={`${reportDate.year}-${String(reportDate.month).padStart(2, '0')}`}
                        onChange={e => {
                            const d = new Date(e.target.value);
                            if(!isNaN(d.getTime())) setReportDate({ year: d.getFullYear(), month: d.getMonth() + 1 });
                        }}
                    />
                </div>

                <div className="flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-100">
                    <label className="font-bold text-gray-700 text-sm">保管料単価 (一律):</label>
                    {isUnitPriceEditing ? (
                        <div className="flex gap-1">
                            <input 
                                type="number" 
                                className="w-24 border rounded p-1 text-right font-bold"
                                value={tempUnitPrice}
                                onChange={(e) => setTempUnitPrice(Number(e.target.value))}
                            />
                            <button onClick={saveUnitPrice} className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">保存</button>
                            <button onClick={() => setIsUnitPriceEditing(false)} className="text-gray-500 px-2 py-1 text-xs">キャンセル</button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-blue-800">{formatCurrency(globalUnitPrice)}</span>
                            <button onClick={() => { setTempUnitPrice(globalUnitPrice); setIsUnitPriceEditing(true); }} className="text-gray-400 hover:text-blue-600">
                                <Edit3 size={16} />
                            </button>
                        </div>
                    )}
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
                    <ShieldCheck className="text-blue-600" /> 最大在庫計算・請求内訳
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-blue-50 text-blue-800">
                            <tr>
                                <th className="p-2 border">商品名</th>
                                <th className="p-2 border text-right">1-10日</th>
                                <th className="p-2 border text-right">11-20日</th>
                                <th className="p-2 border text-right">21-末日</th>
                                <th className="p-2 border text-right font-bold">合計数</th>
                                <th className="p-2 border text-right">単価</th>
                                <th className="p-2 border text-right bg-blue-100 font-bold">金額</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => {
                                const d = maxStockData[p.id];
                                const totalQty = d.term1 + d.term2 + d.term3;
                                const amount = totalQty * globalUnitPrice;
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="p-2 border font-bold">{p.name}</td>
                                        <td className="p-2 border text-right">{d.term1}</td>
                                        <td className="p-2 border text-right">{d.term2}</td>
                                        <td className="p-2 border text-right">{d.term3}</td>
                                        <td className="p-2 border text-right font-bold">{totalQty}</td>
                                        <td className="p-2 border text-right text-gray-600">{formatCurrency(globalUnitPrice)}</td>
                                        <td className="p-2 border text-right font-bold bg-blue-50 text-blue-700">
                                            {formatCurrency(amount)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
                 <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
                    <DollarSign className="text-green-600" /> 請求書プレビュー
                 </h2>
                 <div className="flex justify-between items-end p-4 bg-gray-50 rounded-lg">
                     <div>
                         <p className="text-sm text-gray-500">ご請求金額合計 (単価 {formatCurrency(globalUnitPrice)})</p>
                         <p className="text-3xl font-bold text-gray-800">{formatCurrency(invoiceTotal)}</p>
                     </div>
                     <button className="text-sm text-blue-600 underline" onClick={() => window.print()}>印刷する</button>
                 </div>
             </div>
           </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in max-w-4xl mx-auto">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-700 border-b pb-2">
                    <Settings className="text-blue-600" /> 商品マスター
                </h2>
                
                <form onSubmit={handleAddProduct} className="flex gap-2 mb-6">
                    <input type="text" placeholder="商品名 (例: 商品A)" className="flex-1 p-3 border rounded-lg"
                        value={newProductName} onChange={e => setNewProductName(e.target.value)} required />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold whitespace-nowrap">追加</button>
                </form>

                <div className="border rounded-lg divide-y">
                    {products.map(p => (
                        <div key={p.id} className="p-4 flex justify-between items-center">
                            <span className="font-bold text-lg">{p.name}</span>
                            <button 
                                onClick={() => handleDeleteProduct(p.id, p.name)} 
                                className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                                title="削除"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                    {products.length === 0 && <p className="p-4 text-center text-gray-400">商品がありません</p>}
                </div>
            </div>
        )}

      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
        <NavButton active={activeTab === 'input'} onClick={() => setActiveTab('input')} icon={<PlusCircle />} label="入力" />
        <NavButton active={activeTab === 'flow'} onClick={() => setActiveTab('flow')} icon={<List />} label="入出庫" />
        <NavButton active={activeTab === 'stock'} onClick={() => setActiveTab('stock')} icon={<TrendingUp />} label="在庫" />
        <NavButton active={activeTab === 'max'} onClick={() => setActiveTab('max')} icon={<FileText />} label="請求" />
        <NavButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Settings />} label="商品" />
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-1 rounded-lg transition-all duration-200 ${active ? 'text-blue-600 bg-blue-50 transform -translate-y-1' : 'text-gray-400 hover:text-gray-600'}`}>
    <div className={`mb-1 ${active ? 'scale-110' : ''}`}>{icon}</div>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);