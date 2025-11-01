import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, message, Typography, Form, Select, DatePicker, Input, Space } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
// import dayjs from 'dayjs'; // 如果未安装dayjs，可以移除，使用原生Date

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AuditLogPage = () => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [operationTypes, setOperationTypes] = useState([]);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // 获取操作类型列表
  useEffect(() => {
    const fetchOperationTypes = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('/audit-logs/operation-types', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.code === 200) {
          setOperationTypes(response.data.data);
        }
      } catch (error) {
        console.error('获取操作类型失败:', error);
      }
    };
    fetchOperationTypes();
  }, []);

  // 查询审计日志
  const fetchAuditLogs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const values = form.getFieldsValue();
      
      const queryParams = {
        userId: values.userId || null,
        username: values.username || null,
        operationType: values.operationType || null,
        status: values.status || null,
        startTime: values.timeRange && values.timeRange[0] 
          ? values.timeRange[0].format('YYYY-MM-DD HH:mm:ss') 
          : null,
        endTime: values.timeRange && values.timeRange[1] 
          ? values.timeRange[1].format('YYYY-MM-DD HH:mm:ss') 
          : null,
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params
      };

      const response = await axios.post('/audit-logs/query', queryParams, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.code === 200) {
        setLogs(response.data.data.list || []);
        setTotal(response.data.data.total || 0);
        if (response.data.data.page) {
          setPagination(prev => ({
            ...prev,
            current: response.data.data.page
          }));
        }
      } else {
        message.error(response.data.message || '获取审计日志失败');
      }
    } catch (error) {
      message.error('获取审计日志失败：' + error.message);
    } finally {
      setLoading(false);
    }
  }, [form, pagination]);

  // 初始加载
  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // 处理搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchAuditLogs({ page: 1 });
  };

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    setPagination({ current: 1, pageSize: 10 });
    setTimeout(() => {
      fetchAuditLogs({ page: 1 });
    }, 0);
  };

  // 处理分页变化
  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 150,
      render: (type) => {
        const typeMap = {
          'LOGIN': '登录',
          'LOGOUT': '登出',
          'REGISTER': '注册',
          'PASSWORD_CHANGE': '修改密码',
          'PASSWORD_RESET': '重置密码',
          'USER_UPDATE': '更新用户',
          'USER_DELETE': '删除用户',
          'USER_ADD': '添加用户',
          'ROLE_ASSIGN': '分配角色',
          'ROLE_REVOKE': '撤销角色',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '操作描述',
      dataIndex: 'operationDesc',
      key: 'operationDesc',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          'SUCCESS': { text: '成功', color: 'green' },
          'FAILURE': { text: '失败', color: 'red' },
        };
        const config = statusMap[status] || { text: status, color: 'default' };
        return <span style={{ color: config.color === 'green' ? '#52c41a' : config.color === 'red' ? '#ff4d4f' : '#000' }}>
          {config.text}
        </span>;
      },
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
    },
    {
      title: '请求方法',
      dataIndex: 'requestMethod',
      key: 'requestMethod',
      width: 100,
    },
    {
      title: '请求路径',
      dataIndex: 'requestPath',
      key: 'requestPath',
      width: 200,
      ellipsis: true,
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      width: 200,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time) => {
        if (!time) return '-';
        const date = new Date(time);
        return isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-CN');
      },
    },
  ];

  return (
    <div className="audit-log-container" style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>审计日志</Title>
      </div>

      {/* 搜索表单 */}
      <Form
        form={form}
        layout="inline"
        style={{ marginBottom: 16, padding: 16, background: theme === 'dark' ? '#1f1f1f' : '#fff', borderRadius: 8 }}
      >
        <Form.Item name="username" label="用户名">
          <Input placeholder="请输入用户名" style={{ width: 150 }} allowClear />
        </Form.Item>
        
        <Form.Item name="operationType" label="操作类型">
          <Select placeholder="请选择操作类型" style={{ width: 150 }} allowClear>
            {operationTypes.map(type => {
              const typeMap = {
                'LOGIN': '登录',
                'LOGOUT': '登出',
                'REGISTER': '注册',
                'PASSWORD_CHANGE': '修改密码',
                'PASSWORD_RESET': '重置密码',
                'USER_UPDATE': '更新用户',
                'USER_DELETE': '删除用户',
                'USER_ADD': '添加用户',
                'ROLE_ASSIGN': '分配角色',
                'ROLE_REVOKE': '撤销角色',
              };
              return (
                <Select.Option key={type} value={type}>
                  {typeMap[type] || type}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
            <Select.Option value="SUCCESS">成功</Select.Option>
            <Select.Option value="FAILURE">失败</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item name="timeRange" label="时间范围">
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: 400 }}
          />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchAuditLogs()}>
              刷新
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        scroll={{ x: 1500 }}
      />
    </div>
  );
};

export default AuditLogPage;

