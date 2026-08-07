export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: number;
  level: string;
  category_id: number;
  instructor_id: number;

  category_name: string;
  instructor_name: string;
}
