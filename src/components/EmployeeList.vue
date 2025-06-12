<template>
    <div>
      <h1>Danh sách Nhân viên</h1>
      <ul>
        <li v-for="employee in employees" :key="employee.EmployeeID">
          {{ employee.FirstName }} {{ employee.LastName }} - {{ employee.PositionName }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axiosInstance from "@/utils/axiosInstance";
  
  export default {
    name: "EmployeeList",
    data() {
      return {
        employees: [],
      };
    },
    created() {
      this.fetchEmployees();
    },
    methods: {
      async fetchEmployees() {
        try {
          const response = await axiosInstance.get("/employees");
          this.employees = response.data;
        } catch (error) {
          console.error("Lỗi khi lấy danh sách nhân viên:", error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* CSS đơn giản */
  </style>
  