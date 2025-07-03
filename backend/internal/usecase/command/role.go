package command

import (
	"context"
	"errors"
	"event-management-system/backend/internal/domain/model"
	"event-management-system/backend/internal/domain/repository_interface"
)

// CreateRoleCommand は役割作成のコマンドを表します
type CreateRoleCommand struct {
	Name        string
	Description string
	CreatedBy   string
}

// UpdateRoleCommand は役割更新のコマンドを表します
type UpdateRoleCommand struct {
	RoleName    string
	Description string
	UpdatedBy   string
}

// DeleteRoleCommand は役割削除のコマンドを表します
type DeleteRoleCommand struct {
	RoleName  string
	DeletedBy string
}

// AssignRoleCommand は役割付与のコマンドを表します
type AssignRoleCommand struct {
	RoleName   string
	UserID     string
	AssignedBy string
}

// RemoveRoleCommand は役割削除のコマンドを表します
type RemoveRoleCommand struct {
	RoleName  string
	UserID    string
	RemovedBy string
}

// RoleCommandUsecase は役割コマンドのユースケースを実装します
type RoleCommandUsecase struct {
	RoleRepo repository_interface.RoleRepository
	UserRepo repository_interface.UserRepository
}

// NewRoleCommandUsecase は新しい役割コマンドユースケースを作成します
func NewRoleCommandUsecase(rr repository_interface.RoleRepository, ur repository_interface.UserRepository) *RoleCommandUsecase {
	return &RoleCommandUsecase{RoleRepo: rr, UserRepo: ur}
}

// CreateRole は新しい役割を作成します
func (uc *RoleCommandUsecase) CreateRole(ctx context.Context, cmd *CreateRoleCommand) error {
	// 役割が既に存在するかチェック
	exists, err := uc.RoleRepo.Exists(ctx, cmd.Name)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("role already exists")
	}

	// 作成者の存在確認
	_, err = uc.UserRepo.FindByID(ctx, cmd.CreatedBy)
	if err != nil {
		return err
	}

	// 新しい役割を作成
	role := model.NewRole(cmd.Name, cmd.Description, cmd.CreatedBy)

	// 保存
	return uc.RoleRepo.Save(ctx, role)
}

// UpdateRole は役割を更新します
func (uc *RoleCommandUsecase) UpdateRole(ctx context.Context, cmd *UpdateRoleCommand) error {
	// 役割の存在確認
	role, err := uc.RoleRepo.FindByName(ctx, cmd.RoleName)
	if err != nil {
		return err
	}

	// 更新者の権限チェック
	updater, err := uc.UserRepo.FindByID(ctx, cmd.UpdatedBy)
	if err != nil {
		return err
	}

	if !role.CanEdit(cmd.UpdatedBy, updater.Roles) {
		return errors.New("insufficient permissions to edit role")
	}

	// 役割を更新
	role.Description = cmd.Description

	// 保存
	return uc.RoleRepo.Save(ctx, role)
}

// DeleteRole は役割を削除します
func (uc *RoleCommandUsecase) DeleteRole(ctx context.Context, cmd *DeleteRoleCommand) error {
	// 役割の存在確認
	role, err := uc.RoleRepo.FindByName(ctx, cmd.RoleName)
	if err != nil {
		return err
	}

	// 削除者の権限チェック
	deleter, err := uc.UserRepo.FindByID(ctx, cmd.DeletedBy)
	if err != nil {
		return err
	}

	if !role.CanDelete(cmd.DeletedBy, deleter.Roles) {
		return errors.New("insufficient permissions to delete role")
	}

	// 削除実行
	return uc.RoleRepo.Delete(ctx, cmd.RoleName)
}

// AssignRole はユーザーに役割を付与します
func (uc *RoleCommandUsecase) AssignRole(ctx context.Context, cmd *AssignRoleCommand) error {
	// 役割の存在確認
	role, err := uc.RoleRepo.FindByName(ctx, cmd.RoleName)
	if err != nil {
		return err
	}

	// 付与者の権限チェック
	assigner, err := uc.UserRepo.FindByID(ctx, cmd.AssignedBy)
	if err != nil {
		return err
	}

	if !role.CanAssign(cmd.AssignedBy, assigner.Roles) {
		return errors.New("insufficient permissions to assign role")
	}

	// 対象ユーザーの存在確認
	targetUser, err := uc.UserRepo.FindByID(ctx, cmd.UserID)
	if err != nil {
		return err
	}

	// 既に付与されているかチェック
	for _, existingRole := range targetUser.Roles {
		if model.UserRole(cmd.RoleName) == existingRole {
			return errors.New("role already assigned")
		}
	}

	// 役割を付与
	targetUser.Roles = append(targetUser.Roles, model.UserRole(cmd.RoleName))

	// 保存
	return uc.UserRepo.Save(ctx, targetUser)
}

// RemoveRole はユーザーから役割を削除します
func (uc *RoleCommandUsecase) RemoveRole(ctx context.Context, cmd *RemoveRoleCommand) error {
	// 役割の存在確認
	role, err := uc.RoleRepo.FindByName(ctx, cmd.RoleName)
	if err != nil {
		return err
	}

	// 削除者の権限チェック
	remover, err := uc.UserRepo.FindByID(ctx, cmd.RemovedBy)
	if err != nil {
		return err
	}

	if !role.CanAssign(cmd.RemovedBy, remover.Roles) {
		return errors.New("insufficient permissions to remove role")
	}

	// 対象ユーザーの存在確認
	targetUser, err := uc.UserRepo.FindByID(ctx, cmd.UserID)
	if err != nil {
		return err
	}

	// 役割が付与されているかチェック
	roleFound := false
	var newRoles []model.UserRole
	for _, existingRole := range targetUser.Roles {
		if model.UserRole(cmd.RoleName) == existingRole {
			roleFound = true
		} else {
			newRoles = append(newRoles, existingRole)
		}
	}

	if !roleFound {
		return errors.New("role not assigned to user")
	}

	// 役割を削除
	targetUser.Roles = newRoles

	// 保存
	return uc.UserRepo.Save(ctx, targetUser)
}
