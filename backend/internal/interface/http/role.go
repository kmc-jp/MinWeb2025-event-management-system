package http

import (
	"net/http"
	"strings"

	"event-management-system/backend/internal/usecase/command"
	"event-management-system/backend/internal/usecase/query"

	"github.com/gin-gonic/gin"
)

// RoleHandler は役割関連のHTTPハンドラー
type RoleHandler struct {
	roleCommandUsecase *command.RoleCommandUsecase
	roleQueryUsecase   *query.RoleQueryUsecase
	userQueryUsecase   *query.UserQueryUsecase
}

// NewRoleHandler は新しい役割ハンドラーを作成
func NewRoleHandler(rcu *command.RoleCommandUsecase, rqu *query.RoleQueryUsecase, uqu *query.UserQueryUsecase) *RoleHandler {
	return &RoleHandler{
		roleCommandUsecase: rcu,
		roleQueryUsecase:   rqu,
		userQueryUsecase:   uqu,
	}
}

// CreateRoleRequest は役割作成リクエスト
type CreateRoleRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description" binding:"required"`
}

// AssignRoleRequest は役割付与リクエスト
type AssignRoleRequest struct {
	RoleName string `json:"role_name" binding:"required"`
}

// UpdateRoleRequest は役割更新リクエスト
type UpdateRoleRequest struct {
	Description string `json:"description" binding:"required"`
}

// RegisterRoutes は役割関連のルートを登録
func (h *RoleHandler) RegisterRoutes(r *gin.Engine) {
	roles := r.Group("/api/roles")
	{
		roles.GET("", h.ListRoles)
		roles.POST("", h.CreateRole)
		roles.GET("/:role_name", h.GetRoleDetails)
		roles.PUT("/:role_name", h.UpdateRole)
		roles.DELETE("/:role_name", h.DeleteRole)
	}

	userRoles := r.Group("/api/users/:user_id/roles")
	{
		userRoles.POST("", h.AssignRoleToUser)
		userRoles.DELETE("", h.RemoveRoleFromUser)
	}
}

// ListRoles は全ての役割を取得
func (h *RoleHandler) ListRoles(c *gin.Context) {
	roles, err := h.roleQueryUsecase.GetAllRoles(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, roles)
}

// GetRoleDetails は役割詳細を取得
func (h *RoleHandler) GetRoleDetails(c *gin.Context) {
	roleName := c.Param("role_name")
	if roleName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "role name is required"})
		return
	}

	role, err := h.roleQueryUsecase.GetRoleDetails(c.Request.Context(), roleName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "role not found"})
		return
	}

	c.JSON(http.StatusOK, role)
}

// CreateRole は新しい役割を作成
func (h *RoleHandler) CreateRole(c *gin.Context) {
	// 認証情報を取得（簡易実装）
	userID := c.GetString("user_id")
	if userID == "" {
		// 開発用：認証が実装されていない場合はダミーユーザーIDを使用
		userID = "dummy-user-001"
	}

	var req CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cmd := &command.CreateRoleCommand{
		Name:        req.Name,
		Description: req.Description,
		CreatedBy:   userID,
	}

	if err := h.roleCommandUsecase.CreateRole(c.Request.Context(), cmd); err != nil {
		if strings.Contains(err.Error(), "already exists") {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// 作成された役割を取得して返す
	role, err := h.roleQueryUsecase.GetRoleByName(c.Request.Context(), req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, role)
}

// UpdateRole は役割を更新
func (h *RoleHandler) UpdateRole(c *gin.Context) {
	// 認証情報を取得（簡易実装）
	userID := c.GetString("user_id")
	if userID == "" {
		// 開発用：認証が実装されていない場合はダミーユーザーIDを使用
		userID = "dummy-user-001"
	}

	roleName := c.Param("role_name")
	if roleName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "role name is required"})
		return
	}

	var req UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cmd := &command.UpdateRoleCommand{
		RoleName:    roleName,
		Description: req.Description,
		UpdatedBy:   userID,
	}

	if err := h.roleCommandUsecase.UpdateRole(c.Request.Context(), cmd); err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else if strings.Contains(err.Error(), "insufficient permissions") {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// 更新された役割を取得して返す
	role, err := h.roleQueryUsecase.GetRoleByName(c.Request.Context(), roleName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, role)
}

// DeleteRole は役割を削除
func (h *RoleHandler) DeleteRole(c *gin.Context) {
	// 認証情報を取得（簡易実装）
	userID := c.GetString("user_id")
	if userID == "" {
		// 開発用：認証が実装されていない場合はダミーユーザーIDを使用
		userID = "dummy-user-001"
	}

	roleName := c.Param("role_name")
	if roleName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "role name is required"})
		return
	}

	cmd := &command.DeleteRoleCommand{
		RoleName:  roleName,
		DeletedBy: userID,
	}

	if err := h.roleCommandUsecase.DeleteRole(c.Request.Context(), cmd); err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else if strings.Contains(err.Error(), "insufficient permissions") {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.Status(http.StatusNoContent)
}

// AssignRoleToUser はユーザーに役割を付与
func (h *RoleHandler) AssignRoleToUser(c *gin.Context) {
	// 認証情報を取得（簡易実装）
	userID := c.GetString("user_id")
	if userID == "" {
		// 開発用：認証が実装されていない場合はダミーユーザーIDを使用
		userID = "dummy-user-001"
	}

	targetUserID := c.Param("user_id")
	if targetUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user id is required"})
		return
	}

	var req AssignRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cmd := &command.AssignRoleCommand{
		RoleName:   req.RoleName,
		UserID:     targetUserID,
		AssignedBy: userID,
	}

	if err := h.roleCommandUsecase.AssignRole(c.Request.Context(), cmd); err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else if strings.Contains(err.Error(), "insufficient permissions") {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		} else if strings.Contains(err.Error(), "already assigned") {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// 更新されたユーザー情報を取得して返す
	user, err := h.userQueryUsecase.GetUser(c.Request.Context(), targetUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

// RemoveRoleFromUser はユーザーから役割を削除
func (h *RoleHandler) RemoveRoleFromUser(c *gin.Context) {
	// 認証情報を取得（簡易実装）
	userID := c.GetString("user_id")
	if userID == "" {
		// 開発用：認証が実装されていない場合はダミーユーザーIDを使用
		userID = "dummy-user-001"
	}

	targetUserID := c.Param("user_id")
	if targetUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user id is required"})
		return
	}

	roleName := c.Query("role_name")
	if roleName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "role name is required"})
		return
	}

	cmd := &command.RemoveRoleCommand{
		RoleName:  roleName,
		UserID:    targetUserID,
		RemovedBy: userID,
	}

	if err := h.roleCommandUsecase.RemoveRole(c.Request.Context(), cmd); err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else if strings.Contains(err.Error(), "insufficient permissions") {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		} else if strings.Contains(err.Error(), "not assigned") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// 更新されたユーザー情報を取得して返す
	user, err := h.userQueryUsecase.GetUser(c.Request.Context(), targetUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}
