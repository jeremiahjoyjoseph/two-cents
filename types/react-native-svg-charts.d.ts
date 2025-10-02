declare module 'react-native-svg-charts' {
  import { Component } from 'react';
  
  interface PieChartProps {
    style?: any;
    data: Array<{
      value: number;
      svg: { fill: string };
      key: string;
    }>;
    innerRadius?: any;
    outerRadius?: any;
  }
  
  export class PieChart extends Component<PieChartProps> {}
}
