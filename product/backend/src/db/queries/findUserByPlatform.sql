SELECT * FROM users
WHERE users.id = (
 SELECT user_id
 FROM platforms
 WHERE platforms.platform_id=${platform_id} AND platforms.platform_type=${platform_type}
)