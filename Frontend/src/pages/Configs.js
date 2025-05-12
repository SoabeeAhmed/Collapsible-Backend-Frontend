import { TbRulerMeasure2, TbDatabaseStar, TbHierarchy3 } from "react-icons/tb";

const Configs = [
  { 
    id: 1, 
    title: 'Data Measure', 
    icon: <TbRulerMeasure2 />,
    subcategories: [
      { title: 'DQ Check' },
      { title: 'DQ Metric' }
    ]
  },
  { 
    id: 2, 
    title: 'Data Quality',
    icon: <TbDatabaseStar />,
    subcategories: [
      { title: 'Data Integrity' },
      { title: 'Data Accuracy' }
    ]
  },
  { 
    id: 3, 
    title: 'Data Hierarchy', 
    icon: <TbHierarchy3 />,
    subcategories: [
      { title: 'Data Classification' },
      { title: 'Data Structure' }
    ]
  }
];

export default Configs;