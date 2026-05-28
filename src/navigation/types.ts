import type { NavigatorScreenParams } from '@react-navigation/native';

export type DashboardStackParamList = {
  DashboardHome: undefined;
};

export type AttendanceStackParamList = {
  AttendanceHome: undefined;
  AttendanceHistory: undefined;
};

export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
};

export type AppDrawerParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Attendance: NavigatorScreenParams<AttendanceStackParamList>;
  Tasks: NavigatorScreenParams<TaskStackParamList>;
};

