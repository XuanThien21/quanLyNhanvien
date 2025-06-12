const router = new VueRouter({
    routes: [
      { path: "/login", component: Login },
      { 
        path: "/admin-dashboard", 
        component: AdminDashboard, 
        beforeEnter: (to, from, next) => {
          const role = localStorage.getItem("role");
          if (role === "Admin") next();
          else next("/login");
        },
      },
      { 
        path: "/user-dashboard", 
        component: UserDashboard, 
        beforeEnter: (to, from, next) => {
          const role = localStorage.getItem("role");
          if (role === "User") next();
          else next("/login");
        },
      },
    ],
  });
  