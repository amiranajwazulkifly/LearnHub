SELECT enumlabel
FROM pg_enum
JOIN pg_type
  ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'course_status'
ORDER BY enumsortorder;