var stateRoot = {
	main: {
		transitions: [{
			event: 'immediate',
			from: 'initial'
		}],
		substates: {
			home: {
				transitions: [{
					event: 'immediate',
					from: 'initial'
				}, {
					event: 'key-right',
					to: 'connection'
				}]
			},
			connection: {
				transitions: [{
					event: 'key-right',
					to: 'search'
				}, {
					event: 'key-left',
					to: 'home'
				}]
			},
			search: {
				transitions: [{
					event: 'key-right',
					to: 'account'
				}, {
					event: 'key-left',
					to: 'connection'
				}]
			},
			account: {
				transitions: [{
					event: 'key-left',
					to: 'search'
				}]
			}
		}
	}
};