import {API_ENDPOINTS} from "~/api/endpoints";

export const useAuth = () => {
    // JWTトークンをlocalstorageで管理するのはもうやめだ
    const userInfo = useState<{ id?: string; email?: string; name?: string; icon?: string; } | null>('userInfo', () => null);
    const loading = ref(false);
    const router = useRouter();

    // これからの時代Cookieよ
    const authToken = useCookie<string | null>('auth-token', {
        default: () => null,
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
    });

    // tokenの保存
    const setAuthToken = (token: string | null) => {
        authToken.value = token;
    }

    // ログイン処理
    const login = async (email: string, password: string) => {
        loading.value = true;
        try {
            const response = await fetchData().fetch('/api/accounts/login', 'POST', { email, password })
            const { token, user } = response

            //tokenの保存
            setAuthToken(token);

            userInfo.value = user;
            await router.push("/crm/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            alert((error as any)?.data?.error || "ログインに失敗しました");
        } finally {
            loading.value = false;
        }
    };

    // アカウント作成処理
    const register = async (email: string, password: string, name: string) => {
        loading.value = true;
        try {
            const response = await fetchData().fetch('/api/accounts/register', 'POST', { email, password, name })

            await login(email, password);

        } catch (error) {
            console.error("Login error:", error);
            alert((error as any)?.data?.error || "ログインに失敗しました");
        } finally {
            loading.value = false;
        }
    };

    // ログアウト処理
    const logout = async () => {
        loading.value = true;
        try {
            if (authToken.value) {
                try {
                    await fetchData().fetch('/api/accounts/logout', 'POST')
                } catch (error) {
                    console.warn("サーバー側ログアウトができなかった", error);
                }
            }

            // クライアント側は情報を消す
            setAuthToken(null);
            userInfo.value = null;

            await router.push("/crm/login");
        } catch (error) {
            console.error("ログアウトに失敗", error);
            setAuthToken(null);
            userInfo.value = null;
            alert((error as any)?.data?.error || "ログアウトに失敗しました");
        } finally {
            loading.value = false;
        }
    }

    // ユーザー情報取得
    const fetchUserInfo = async () => {
        loading.value = true;
        try {
            if (!authToken.value) {
                userInfo.value = null;
                await router.push("/crm/login");
                return;
            }

            const response = await fetchData().fetch(API_ENDPOINTS.dashboard)
            userInfo.value = response || null;
        } catch (error) {
            // エラー起こるならtoken無効
            userInfo.value = null;
            if ((error as any)?.status === 401 || (error as any)?.status === 403) {
                setAuthToken(null);
                await router.push("/crm/login");
            } else {
                console.error("error", error)
            }
        } finally {
            loading.value = false;
        }
    }

    onMounted(async () => {
        if (authToken.value) {
            await fetchUserInfo();
        } else {
            await router.push("/crm/login");
        }
    });

    return {
        authToken,
        userInfo,
        loading,
        login,
        register,
        logout,
        fetchUserInfo,
    };
}