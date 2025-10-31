import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Typography, TreeSelect, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

const MenusListPage = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const [menuTree, setMenuTree] = useState([]);
  const [parentMenus, setParentMenus] = useState([]);

  // 加载菜单数据
  const loadMenus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/menus', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.code === 200) {
        setMenus(response.data.data);
        
        // 构建用于选择父菜单的树形结构
        buildParentMenus(response.data.data);
      } else {
        message.error(response.data.message || '加载菜单失败');
      }
    } catch (error) {
      console.error('加载菜单失败:', error);
      message.error('加载菜单失败');
    } finally {
      setLoading(false);
    }
  };

  // 构建父菜单选项
  const buildParentMenus = (allMenus) => {
    // 创建菜单映射
    const menuMap = new Map();
    allMenus.forEach(menu => {
      menuMap.set(menu.id, {
        title: menu.name,
        value: menu.id,
        key: menu.id,
        children: []
      });
    });
    
    // 添加顶级菜单选项
    const rootOption = {
      title: '无（作为顶级菜单）',
      value: 0,
      key: 0
    };
    
    // 构建树形结构
    allMenus.forEach(menu => {
      if (menu.parentId !== 0 && menuMap.has(menu.parentId)) {
        menuMap.get(menu.parentId).children.push(menuMap.get(menu.id));
      }
    });
    
    // 转换为数组
    const treeOptions = [rootOption, ...Array.from(menuMap.values()).filter(menu => menu.title !== undefined)];
    setParentMenus(treeOptions);
  };

  // 处理添加菜单
  const handleAddMenu = () => {
    setEditingMenu(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 处理编辑菜单
  const handleEditMenu = (menu) => {
    setEditingMenu(menu);
    form.setFieldsValue({
      name: menu.name,
      key: menu.key,
      path: menu.path,
      parentId: menu.parentId || 0,
      visible: menu.visible,
      sortOrder: menu.sortOrder,
      icon: menu.icon || '',
      component: menu.component || ''
    });
    setIsModalVisible(true);
  };

  // 处理删除菜单
  const handleDeleteMenu = (menu) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除菜单「${menu.name}」吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await axios.delete(`/menus/${menu.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.code === 200) {
            message.success('菜单删除成功');
            loadMenus(); // 重新加载菜单列表
          } else {
            message.error(response.data.message || '菜单删除失败');
          }
        } catch (error) {
          console.error('菜单删除失败:', error);
          message.error('菜单删除失败');
        }
      }
    });
  };

  // 处理表单提交
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      // 重命名keyPath字段为key，与后端实体类匹配
      const submitValues = {
        ...values,
        key: values.key
      };
      
      const token = localStorage.getItem('accessToken');
      let response;
      
      if (editingMenu) {
        // 更新菜单
        response = await axios.put(`/menus/${editingMenu.id}`, submitValues, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // 创建菜单
        response = await axios.post('/menus', submitValues, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      if (response.data.code === 200) {
        message.success(editingMenu ? '菜单更新成功' : '菜单创建成功');
        setIsModalVisible(false);
        loadMenus(); // 重新加载菜单列表
      } else {
        message.error(response.data.message || (editingMenu ? '菜单更新失败' : '菜单创建失败'));
      }
    } catch (error) {
      console.error('菜单操作失败:', error);
      if (error.response) {
        message.error(error.response.data.message || '操作失败');
      } else {
        message.error('操作失败');
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadMenus();
  }, []);

  // 表格列配置
  const columns = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '菜单标识',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: '访问路径',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
    },
    {
      title: '是否可见',
      dataIndex: 'visible',
      key: 'visible',
      render: (visible) => (
        <span>{visible ? '是' : '否'}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditMenu(record)}
            style={{ marginRight: 8 }}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteMenu(record)}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="roles-list-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4}>菜单管理</Title>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddMenu}
          >
            添加菜单
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadMenus}
            style={{ marginLeft: 10 }}
          >
            刷新
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={menus}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      {/* 菜单编辑模态框 */}
      <Modal
        title={editingMenu ? '编辑菜单' : '添加菜单'}
        open={isModalVisible}
        onOk={handleFormSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="确定"
        cancelText="取消"
        confirmLoading={confirmLoading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            parentId: 0,
            visible: true,
            sortOrder: 0
          }}
        >
          <Form.Item
            name="name"
            label="菜单名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>

          <Form.Item
            name="key"
            label="菜单标识"
            rules={[{ required: true, message: '请输入菜单标识' }]}
          >
            <Input placeholder="请输入菜单标识，如: users-list" />
          </Form.Item>

          <Form.Item
            name="path"
            label="访问路径"
            rules={[{ required: true, message: '请输入访问路径' }]}
          >
            <Input placeholder="请输入访问路径，如: /users" />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="父菜单"
          >
            <TreeSelect
              treeData={parentMenus}
              placeholder="请选择父菜单"
              style={{ width: '100%' }}
              disabled={editingMenu && editingMenu.parentId !== 0}
            />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="排序号"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入排序号" />
          </Form.Item>

          <Form.Item
            name="visible"
            label="是否可见"
            valuePropName="checked"
          >
            <Select placeholder="请选择是否可见">
              <Option value={true}>是</Option>
              <Option value={false}>否</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="icon"
            label="图标"
          >
            <Input placeholder="请输入图标名称" />
          </Form.Item>

          <Form.Item
            name="component"
            label="组件路径"
          >
            <Input placeholder="请输入组件路径" />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        .roles-list-page {
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

export default MenusListPage;