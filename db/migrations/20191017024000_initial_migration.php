<?php

use Phinx\Db\Adapter\MysqlAdapter;

class InitialMigration extends Phinx\Migration\AbstractMigration
{
    public function change()
    {
        $this->execute("ALTER DATABASE CHARACTER SET 'latin1';");
        $this->execute("ALTER DATABASE COLLATE='latin1_swedish_ci';");
        $this->table('businessTypes', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('businessTypeName', 'string', [
                'null' => true,
                'limit' => 50,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'id',
            ])
            ->addColumn('businessTypeDisplayName', 'string', [
                'null' => true,
                'limit' => 200,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessTypeName',
            ])
            ->addColumn('state', 'integer', [
                'null' => false,
                'default' => '1',
                'limit' => '1',
                'after' => 'businessTypeDisplayName',
            ])
            ->addColumn('createdAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'state',
            ])
            ->addColumn('updatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'createdAt',
            ])
            ->create();
        $this->table('businesses', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('organizationId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'id',
            ])
            ->addColumn('businessName', 'string', [
                'null' => true,
                'limit' => 50,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'organizationId',
            ])
            ->addColumn('businessTypeId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'businessName',
            ])
            ->addColumn('businessKraPin', 'string', [
                'null' => true,
                'limit' => 12,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessTypeId',
            ])
            ->addColumn('businessVatNumber', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessKraPin',
            ])
            ->addColumn('businessCurrency', 'string', [
                'null' => false,
                'default' => 'KES',
                'limit' => 5,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessVatNumber',
            ])
            ->addColumn('businessCountryCode', 'string', [
                'null' => false,
                'default' => 'KE',
                'limit' => 5,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessCurrency',
            ])
            ->addColumn('businessPhoneNumber', 'string', [
                'null' => true,
                'limit' => 15,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessCountryCode',
            ])
            ->addColumn('businessEmail', 'string', [
                'null' => true,
                'limit' => 100,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessPhoneNumber',
            ])
            ->addColumn('businessCountry', 'string', [
                'null' => false,
                'default' => 'KENYA',
                'limit' => 20,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessEmail',
            ])
            ->addColumn('businessPhysicalAddress', 'string', [
                'null' => true,
                'limit' => 255,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessCountry',
            ])
            ->addColumn('businessPostalAddress', 'string', [
                'null' => true,
                'limit' => 255,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessPhysicalAddress',
            ])
            ->addColumn('businessLogoImage', 'string', [
                'null' => true,
                'limit' => 255,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessPostalAddress',
            ])
            ->addColumn('state', 'integer', [
                'null' => false,
                'default' => '1',
                'limit' => '1',
                'after' => 'businessLogoImage',
            ])
            ->addColumn('createdAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'state',
            ])
            ->addColumn('updatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'createdAt',
            ])
        ->addIndex(['businessTypeId'], [
                'name' => 'businessTypeId',
                'unique' => false,
            ])
        ->addIndex(['organizationId'], [
                'name' => 'organizationId',
                'unique' => false,
            ])
            ->create();
        $this->table('customers', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('businessId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'id',
            ])
            ->addColumn('customerFirstName', 'string', [
                'null' => true,
                'limit' => 50,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'businessId',
            ])
            ->addColumn('customerLastName', 'string', [
                'null' => true,
                'limit' => 50,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'customerFirstName',
            ])
            ->addColumn('customerBusinessName', 'string', [
                'null' => true,
                'limit' => 100,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'customerLastName',
            ])
            ->addColumn('customerEmail', 'string', [
                'null' => true,
                'limit' => 50,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'customerBusinessName',
            ])
            ->addColumn('customerCountryCode', 'integer', [
                'null' => true,
                'limit' => '5',
                'after' => 'customerEmail',
            ])
            ->addColumn('customerPhoneNumber', 'string', [
                'null' => true,
                'limit' => 15,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'customerCountryCode',
            ])
            ->addColumn('customerProfilePicture', 'string', [
                'null' => true,
                'limit' => 250,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'customerPhoneNumber',
            ])
            ->addColumn('kraPin', 'string', [
                'null' => true,
                'limit' => 15,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'customerProfilePicture',
            ])
            ->addColumn('customerPostalAddress', 'string', [
                'null' => true,
                'limit' => 100,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'kraPin',
            ])
            ->addColumn('customerAddress', 'text', [
                'null' => true,
                'limit' => 65535,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'customerPostalAddress',
            ])
            ->addColumn('isBusiness', 'integer', [
                'null' => false,
                'default' => '0',
                'limit' => '1',
                'after' => 'customerAddress',
            ])
            ->addColumn('state', 'integer', [
                'null' => false,
                'default' => '1',
                'limit' => '1',
                'after' => 'isBusiness',
            ])
            ->addColumn('createdAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'state',
            ])
            ->addColumn('updatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'createdAt',
            ])
        ->addIndex(['kraPin'], [
                'name' => 'kraPin',
                'unique' => true,
            ])
        ->addIndex(['businessId'], [
                'name' => 'businessId',
                'unique' => false,
            ])
            ->create();
        $this->table('measurementUnits', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('measurementName', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'id',
            ])
            ->addColumn('measurementAbbreviation', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'measurementName',
            ])
            ->addColumn('state', 'integer', [
                'null' => false,
                'default' => '1',
                'limit' => '1',
                'after' => 'measurementAbbreviation',
            ])
            ->addColumn('createdAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'state',
            ])
            ->addColumn('updatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'createdAt',
            ])
        ->addIndex(['measurementAbbreviation'], [
                'name' => 'measurementAbbreviation',
                'unique' => true,
            ])
            ->create();
        $this->table('orderItems', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('orderId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'id',
            ])
            ->addColumn('productId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'orderId',
            ])
            ->addColumn('subProductId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'productId',
            ])
            ->addColumn('sellAs', 'string', [
                'null' => true,
                'limit' => 11,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'subProductId',
            ])
            ->addColumn('qty', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'sellAs',
            ])
            ->addColumn('soldMeasurement', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'qty',
            ])
            ->addColumn('measurementBefore', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'soldMeasurement',
            ])
            ->addColumn('measurementAfter', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'measurementBefore',
            ])
            ->addColumn('price', 'double', [
                'null' => true,
                'after' => 'measurementAfter',
            ])
            ->addColumn('state', 'integer', [
                'null' => false,
                'default' => '1',
                'limit' => '1',
                'after' => 'price',
            ])
            ->addColumn('createdAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'state',
            ])
            ->addColumn('updatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'createdAt',
            ])
        ->addIndex(['orderId'], [
                'name' => 'orderId',
                'unique' => false,
            ])
        ->addIndex(['productId'], [
                'name' => 'productId',
                'unique' => false,
            ])
        ->addIndex(['subProductId'], [
                'name' => 'subProductId',
                'unique' => false,
            ])
            ->create();
        $this->table('orders', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('businessId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'id',
            ])
            ->addColumn('userId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'businessId',
            ])
            ->addColumn('customerId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'userId',
            ])
            ->addColumn('customerDetails', 'text', [
                'null' => true,
                'limit' => 65535,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'customerId',
            ])
            ->addColumn('total', 'double', [
                'null' => false,
                'default' => '0.00',
                'after' => 'customerDetails',
            ])
            ->addColumn('tenderedAmount', 'double', [
                'null' => false,
                'default' => '0.00',
                'after' => 'total',
            ])
            ->addColumn('changeAmount', 'double', [
                'null' => false,
                'default' => '0.00',
                'after' => 'tenderedAmount',
            ])
            ->addColumn('paymentMethod', 'string', [
                'null' => true,
                'limit' => 10,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'changeAmount',
            ])
            ->addColumn('orderType', 'string', [
                'null' => true,
                'limit' => 11,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentMethod',
            ])
            ->addColumn('orderStatus', 'string', [
                'null' => false,
                'default' => 'PENDING',
                'limit' => 15,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'orderType',
            ])
            ->addColumn('createdAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'orderStatus',
            ])
            ->addColumn('updatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'createdAt',
            ])
        ->addIndex(['businessId'], [
                'name' => 'businessId',
                'unique' => false,
            ])
        ->addIndex(['userId'], [
                'name' => 'userId',
                'unique' => false,
            ])
        ->addIndex(['customerId'], [
                'name' => 'customerId',
                'unique' => false,
            ])
            ->create();
        $this->table('organizations', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('organizationName', 'string', [
                'null' => true,
                'limit' => 100,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'id',
            ])
            ->addColumn('organizationCreatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'organizationName',
            ])
            ->addColumn('organizationUpdatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'organizationCreatedAt',
            ])
            ->create();
        $this->table('paymentPlanFeatures', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('paymentPlanId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'id',
            ])
            ->addColumn('paymentPlanFeatureName', 'string', [
                'null' => true,
                'limit' => 255,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanId',
            ])
            ->addColumn('paymentPlanFeatureDescription', 'text', [
                'null' => true,
                'limit' => 65535,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanFeatureName',
            ])
            ->addColumn('paymentPlanFeatureState', 'integer', [
                'null' => true,
                'default' => '1',
                'limit' => '1',
                'after' => 'paymentPlanFeatureDescription',
            ])
            ->addColumn('paymentFeatureCreatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanFeatureState',
            ])
            ->addColumn('paymentFeatureUpdatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentFeatureCreatedAt',
            ])
        ->addIndex(['paymentPlanId'], [
                'name' => 'paymentPlanId',
                'unique' => false,
            ])
        ->addIndex(['id'], [
                'name' => 'id',
                'unique' => false,
            ])
            ->create();
        $this->table('paymentPlanPeriods', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('paymentPlanId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'id',
            ])
            ->addColumn('paymentPlanPeriodName', 'string', [
                'null' => true,
                'limit' => 100,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanId',
            ])
            ->addColumn('paymentPlanPeriodType', 'string', [
                'null' => true,
                'limit' => 20,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanPeriodName',
            ])
            ->addColumn('paymentPlanPeriodPrice', 'double', [
                'null' => true,
                'default' => '0.00',
                'after' => 'paymentPlanPeriodType',
            ])
            ->addColumn('paymentPlanPeriodSalePrice', 'double', [
                'null' => true,
                'default' => '0.00',
                'after' => 'paymentPlanPeriodPrice',
            ])
            ->addColumn('paymentPlanPeriodAvailableFrom', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanPeriodSalePrice',
            ])
            ->addColumn('paymentPlanPeriodAvailableTo', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanPeriodAvailableFrom',
            ])
            ->addColumn('paymentPlanPeriodState', 'integer', [
                'null' => true,
                'default' => '1',
                'limit' => '1',
                'after' => 'paymentPlanPeriodAvailableTo',
            ])
            ->addColumn('paymentPlanPeriodCreatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanPeriodState',
            ])
            ->addColumn('paymentPlanPeriodUpdatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanPeriodCreatedAt',
            ])
        ->addIndex(['paymentPlanId'], [
                'name' => 'paymentPlanId',
                'unique' => false,
            ])
        ->addIndex(['paymentPlanId'], [
                'name' => 'paymentPlanId_2',
                'unique' => false,
            ])
            ->create();
        $this->table('paymentPlanTransactions', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('paymentPlanPeriodId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'id',
            ])
            ->addColumn('organizationId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'paymentPlanPeriodId',
            ])
            ->addColumn('paymentPlanTransactionReference', 'string', [
                'null' => true,
                'limit' => 100,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'organizationId',
            ])
            ->addColumn('paymentPlanTransactionPaymentMethod', 'string', [
                'null' => true,
                'limit' => 50,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanTransactionReference',
            ])
            ->addColumn('paymentPlanTransactionState', 'integer', [
                'null' => true,
                'default' => '1',
                'limit' => '1',
                'after' => 'paymentPlanTransactionPaymentMethod',
            ])
            ->addColumn('paymentPlanTransactionCreatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanTransactionState',
            ])
            ->addColumn('paymentPlanTransactionUpdatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanTransactionCreatedAt',
            ])
            ->addColumn('paymentPlanTransactionExpiresOn', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanTransactionUpdatedAt',
            ])
        ->addIndex(['organizationId'], [
                'name' => 'organizationId',
                'unique' => false,
            ])
        ->addIndex(['paymentPlanPeriodId'], [
                'name' => 'paymentPlanPeriodId',
                'unique' => false,
            ])
            ->create();
        $this->table('paymentPlans', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('paymentPlanName', 'string', [
                'null' => true,
                'limit' => 100,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'id',
            ])
            ->addColumn('paymentPlanDescription', 'text', [
                'null' => true,
                'limit' => 65535,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanName',
            ])
            ->addColumn('paymentPlanState', 'integer', [
                'null' => true,
                'default' => '1',
                'limit' => '1',
                'after' => 'paymentPlanDescription',
            ])
            ->addColumn('paymentPlanCreatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanState',
            ])
            ->addColumn('paymentPlanUpdatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'paymentPlanCreatedAt',
            ])
            ->create();
        $this->table('productCategories', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('productCategoryName', 'string', [
                'null' => true,
                'limit' => 100,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'id',
            ])
            ->addColumn('productCategoryDesc', 'text', [
                'null' => true,
                'limit' => 65535,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'productCategoryName',
            ])
            ->addColumn('parentId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'productCategoryDesc',
            ])
            ->addColumn('businessId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'parentId',
            ])
            ->addColumn('state', 'integer', [
                'null' => false,
                'default' => '1',
                'limit' => '1',
                'after' => 'businessId',
            ])
            ->addColumn('createdAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'state',
            ])
            ->addColumn('updatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'createdAt',
            ])
        ->addIndex(['parentId'], [
                'name' => 'parentId',
                'unique' => false,
            ])
        ->addIndex(['businessId'], [
                'name' => 'businessId',
                'unique' => false,
            ])
            ->create();
        $this->table('productRestocks', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('businessId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'id',
            ])
            ->addColumn('productId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'businessId',
            ])
            ->addColumn('restockQty', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'productId',
            ])
            ->addColumn('restockAvailableFrom', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'restockQty',
            ])
            ->addColumn('restockInitiatedBy', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'restockAvailableFrom',
            ])
            ->addColumn('restockApprovedBy', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'restockInitiatedBy',
            ])
            ->addColumn('restocked', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'restockApprovedBy',
            ])
            ->addColumn('restockState', 'integer', [
                'null' => true,
                'default' => '1',
                'limit' => '1',
                'after' => 'restocked',
            ])
            ->addColumn('restockCreatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'restockState',
            ])
            ->addColumn('restockUpdatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'restockCreatedAt',
            ])
        ->addIndex(['businessId'], [
                'name' => 'businessId',
                'unique' => false,
            ])
        ->addIndex(['productId'], [
                'name' => 'productId',
                'unique' => false,
            ])
        ->addIndex(['restockInitiatedBy'], [
                'name' => 'restockInitiatedBy',
                'unique' => false,
            ])
        ->addIndex(['restockApprovedBy'], [
                'name' => 'restockApprovedBy',
                'unique' => false,
            ])
            ->create();
        $this->table('products', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('productName', 'string', [
                'null' => true,
                'limit' => 100,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'id',
            ])
            ->addColumn('productDescription', 'text', [
                'null' => true,
                'limit' => 65535,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'productName',
            ])
            ->addColumn('productShortDescription', 'string', [
                'null' => true,
                'limit' => 240,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'productDescription',
            ])
            ->addColumn('productCategoryId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'productShortDescription',
            ])
            ->addColumn('productImage', 'string', [
                'null' => true,
                'limit' => 250,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'productCategoryId',
            ])
            ->addColumn('productColor', 'string', [
                'null' => true,
                'limit' => 50,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'productImage',
            ])
            ->addColumn('storageLocation', 'string', [
                'null' => true,
                'limit' => 50,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'productColor',
            ])
            ->addColumn('availableFrom', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'storageLocation',
            ])
            ->addColumn('availableTo', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'availableFrom',
            ])
            ->addColumn('measurement', 'float', [
                'null' => true,
                'after' => 'availableTo',
            ])
            ->addColumn('measurementUnitId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'measurement',
            ])
            ->addColumn('sku', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'measurementUnitId',
            ])
            ->addColumn('sellAs', 'string', [
                'null' => true,
                'default' => 'FULL',
                'limit' => 11,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'sku',
            ])
            ->addColumn('customSaleUnit', 'integer', [
                'null' => true,
                'default' => '1',
                'limit' => '30',
                'after' => 'sellAs',
            ])
            ->addColumn('qty', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'customSaleUnit',
            ])
            ->addColumn('price', 'double', [
                'null' => false,
                'default' => '0.00',
                'after' => 'qty',
            ])
            ->addColumn('salePrice', 'double', [
                'null' => true,
                'default' => '0.00',
                'after' => 'price',
            ])
            ->addColumn('unitPrice', 'double', [
                'null' => true,
                'default' => '0.00',
                'after' => 'salePrice',
            ])
            ->addColumn('taxClassId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'unitPrice',
            ])
            ->addColumn('businessId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'taxClassId',
            ])
            ->addColumn('published', 'integer', [
                'null' => false,
                'default' => '1',
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'businessId',
            ])
            ->addColumn('state', 'integer', [
                'null' => false,
                'default' => '1',
                'limit' => '1',
                'after' => 'published',
            ])
            ->addColumn('createdAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'state',
            ])
            ->addColumn('updatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'createdAt',
            ])
        ->addIndex(['productCategoryId'], [
                'name' => 'productCategoryId',
                'unique' => false,
            ])
        ->addIndex(['businessId'], [
                'name' => 'businessId',
                'unique' => false,
            ])
        ->addIndex(['measurementUnitId'], [
                'name' => 'measurementUnitId',
                'unique' => false,
            ])
            ->create();
        $this->table('subProductList', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('primaryProductId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'id',
            ])
            ->addColumn('measurement', 'float', [
                'null' => true,
                'after' => 'primaryProductId',
            ])
            ->addColumn('measurementUnitId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'measurement',
            ])
            ->addColumn('state', 'integer', [
                'null' => false,
                'default' => '1',
                'limit' => '1',
                'after' => 'measurementUnitId',
            ])
            ->addColumn('createdAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'state',
            ])
            ->addColumn('updatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'createdAt',
            ])
        ->addIndex(['primaryProductId'], [
                'name' => 'primaryProductId',
                'unique' => false,
            ])
        ->addIndex(['measurementUnitId'], [
                'name' => 'measurementUnitId',
                'unique' => false,
            ])
            ->create();
        $this->table('userOrganizationPermissions', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('createUsers', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'id',
            ])
            ->addColumn('deleteUsers', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'createUsers',
            ])
            ->addColumn('editUsers', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'deleteUsers',
            ])
            ->addColumn('viewUsers', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'editUsers',
            ])
            ->addColumn('createBusinesses', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'viewUsers',
            ])
            ->addColumn('deleteBusinesses', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'createBusinesses',
            ])
            ->addColumn('editBusinesses', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'deleteBusinesses',
            ])
            ->addColumn('viewBusinesses', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'editBusinesses',
            ])
            ->addColumn('viewSales', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'viewBusinesses',
            ])
            ->addColumn('editOrganizationDetails', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'viewSales',
            ])
            ->addColumn('viewOrganizationDetails', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'editOrganizationDetails',
            ])
            ->addColumn('organizationUserPermissionCreatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'viewOrganizationDetails',
            ])
            ->addColumn('organizationUserPermissionUpdatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'organizationUserPermissionCreatedAt',
            ])
            ->create();
        $this->table('userPermissions', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('createUsers', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'id',
            ])
            ->addColumn('editUsers', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'createUsers',
            ])
            ->addColumn('viewUsers', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'editUsers',
            ])
            ->addColumn('deleteUsers', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'viewUsers',
            ])
            ->addColumn('createUserRoles', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'deleteUsers',
            ])
            ->addColumn('viewUserRoles', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'createUserRoles',
            ])
            ->addColumn('deleteUserRoles', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'viewUserRoles',
            ])
            ->addColumn('editUserRoles', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'deleteUserRoles',
            ])
            ->addColumn('createProducts', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'editUserRoles',
            ])
            ->addColumn('editProducts', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'createProducts',
            ])
            ->addColumn('viewProducts', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'editProducts',
            ])
            ->addColumn('deleteProducts', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'viewProducts',
            ])
            ->addColumn('createCustomers', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'deleteProducts',
            ])
            ->addColumn('editCustomers', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'createCustomers',
            ])
            ->addColumn('viewCustomers', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'editCustomers',
            ])
            ->addColumn('deleteCustomers', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'viewCustomers',
            ])
            ->addColumn('makeSales', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'deleteCustomers',
            ])
            ->addColumn('viewSales', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'makeSales',
            ])
            ->addColumn('viewBusinessDetails', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'viewSales',
            ])
            ->addColumn('editBusinessDetails', 'integer', [
                'null' => true,
                'limit' => '1',
                'after' => 'viewBusinessDetails',
            ])
            ->addColumn('createdAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'editBusinessDetails',
            ])
            ->addColumn('updatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'createdAt',
            ])
            ->create();
        $this->table('userRoles', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('roleName', 'string', [
                'null' => true,
                'limit' => 50,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'id',
            ])
            ->addColumn('roleType', 'string', [
                'null' => true,
                'limit' => 50,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'roleName',
            ])
            ->addColumn('roleDescription', 'text', [
                'null' => true,
                'limit' => 65535,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'roleType',
            ])
            ->addColumn('businessId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'roleDescription',
            ])
            ->addColumn('organizationId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'businessId',
            ])
            ->addColumn('userPermissionsId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'organizationId',
            ])
            ->addColumn('userOrganizationPermissionsId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'userPermissionsId',
            ])
            ->addColumn('state', 'integer', [
                'null' => true,
                'default' => '1',
                'limit' => '1',
                'after' => 'userOrganizationPermissionsId',
            ])
            ->addColumn('createdAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'state',
            ])
            ->addColumn('updatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'createdAt',
            ])
        ->addIndex(['businessId'], [
                'name' => 'businessId',
                'unique' => false,
            ])
        ->addIndex(['userPermissionsId'], [
                'name' => 'userPermissionsId',
                'unique' => false,
            ])
        ->addIndex(['organizationId'], [
                'name' => 'organizationId',
                'unique' => false,
            ])
        ->addIndex(['userOrganizationPermissionsId'], [
                'name' => 'organizationUserPermissionsId',
                'unique' => false,
            ])
            ->create();
        $this->table('users', [
                'id' => false,
                'primary_key' => ['id'],
                'engine' => 'InnoDB',
                'encoding' => 'latin1',
                'collation' => 'latin1_swedish_ci',
                'comment' => '',
                'row_format' => 'DYNAMIC',
            ])
            ->addColumn('id', 'integer', [
                'null' => false,
                'limit' => MysqlAdapter::INT_REGULAR,
                'identity' => 'enable',
            ])
            ->addColumn('firstName', 'string', [
                'null' => true,
                'limit' => 50,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'id',
            ])
            ->addColumn('lastName', 'string', [
                'null' => true,
                'limit' => 50,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'firstName',
            ])
            ->addColumn('email', 'string', [
                'null' => true,
                'limit' => 50,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'lastName',
            ])
            ->addColumn('phoneCountryCode', 'integer', [
                'null' => true,
                'limit' => '5',
                'after' => 'email',
            ])
            ->addColumn('userPhoneNumber', 'integer', [
                'null' => true,
                'limit' => '15',
                'after' => 'phoneCountryCode',
            ])
            ->addColumn('password', 'string', [
                'null' => true,
                'limit' => 200,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'userPhoneNumber',
            ])
            ->addColumn('roleId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'password',
            ])
            ->addColumn('businessId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'roleId',
            ])
            ->addColumn('organizationId', 'integer', [
                'null' => true,
                'limit' => MysqlAdapter::INT_REGULAR,
                'after' => 'businessId',
            ])
            ->addColumn('profilePicture', 'string', [
                'null' => true,
                'limit' => 250,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'organizationId',
            ])
            ->addColumn('apiToken', 'text', [
                'null' => true,
                'limit' => 65535,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'profilePicture',
            ])
            ->addColumn('activated', 'integer', [
                'null' => true,
                'default' => '0',
                'limit' => '1',
                'after' => 'apiToken',
            ])
            ->addColumn('activationCode', 'string', [
                'null' => true,
                'limit' => 11,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'activated',
            ])
            ->addColumn('resetPasswordCode', 'string', [
                'null' => true,
                'limit' => 11,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'activationCode',
            ])
            ->addColumn('state', 'integer', [
                'null' => true,
                'default' => '1',
                'limit' => '1',
                'after' => 'resetPasswordCode',
            ])
            ->addColumn('createdAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'state',
            ])
            ->addColumn('updatedAt', 'string', [
                'null' => true,
                'limit' => 30,
                'collation' => 'latin1_swedish_ci',
                'encoding' => 'latin1',
                'after' => 'createdAt',
            ])
        ->addIndex(['email'], [
                'name' => 'email',
                'unique' => true,
            ])
        ->addIndex(['roleId'], [
                'name' => 'roleId',
                'unique' => false,
            ])
        ->addIndex(['businessId'], [
                'name' => 'businessId',
                'unique' => false,
            ])
        ->addIndex(['organizationId'], [
                'name' => 'organizationId',
                'unique' => false,
            ])
            ->create();
    }
}
